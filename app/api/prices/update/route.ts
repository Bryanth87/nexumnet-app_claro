import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { withAdminAuth } from "@/app/api/_middleware/auth"
import { getCorsHeaders, handleOptions } from "@/app/api/_middleware/cors"
import { revalidatePath } from "next/cache"
import type { EquipmentPrices } from "@/lib/prices-storage"

const VALID_KEYS: (keyof EquipmentPrices)[] = [
  "MEDIA_PLAYER",
  "SPLITTER_1X2",
  "SPLITTER_1X4",
  "SPLITTER_1X8",
  "HDMI_CABLE",
  "MONTHLY_MAINTENANCE_PER_AGENCY",
  "MEDIA_PLAYER_LICENSE",
  "BANKING_COMMISSION_RATE",
]

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)

  // Verificar JWT
  const auth = await withAdminAuth(request)
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: corsHeaders }
    )
  }

  let body: { prices?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Body inválido" },
      { status: 400, headers: corsHeaders }
    )
  }

  const { prices } = body

  if (!prices || typeof prices !== "object") {
    return NextResponse.json(
      { error: "Objeto de precios inválido" },
      { status: 400, headers: corsHeaders }
    )
  }

  // Actualizar cada precio en Supabase
  const errors: string[] = []

  for (const key of VALID_KEYS) {
    const rawValue = prices[key]
    if (rawValue === undefined) continue

    const value = Number(rawValue)
    if (isNaN(value) || value < 0 || value > 99999) {
      errors.push(`Valor inválido para ${key}: ${rawValue}`)
      continue
    }

    const { error } = await supabaseAdmin
      .from("prices")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key)

    if (error) {
      errors.push(`Error al actualizar ${key}: ${error.message}`)
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors.join(", ") },
      { status: 500, headers: corsHeaders }
    )
  }

  // Invalidar cache de la página pública
  revalidatePath("/")
  revalidatePath("/api/prices")

  return NextResponse.json(
    { success: true },
    { headers: corsHeaders }
  )
}

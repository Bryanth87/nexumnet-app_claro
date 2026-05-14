import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { withAdminAuth } from "@/app/api/_middleware/auth"
import { getCorsHeaders, handleOptions } from "@/app/api/_middleware/cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)

  const auth = await withAdminAuth(request)
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: corsHeaders }
    )
  }

  let body: {
    quote_data?: unknown
    total_monthly?: number
    payment_terms?: number
    agency_count?: number
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Body inválido" },
      { status: 400, headers: corsHeaders }
    )
  }

  const { quote_data, total_monthly, payment_terms, agency_count } = body

  if (!quote_data) {
    return NextResponse.json(
      { error: "quote_data requerido" },
      { status: 400, headers: corsHeaders }
    )
  }

  const { data, error } = await supabaseAdmin
    .from("quotes")
    .insert({ quote_data, total_monthly, payment_terms, agency_count })
    .select("id, created_at")
    .single()

  if (error) {
    console.error("Error saving quote:", error)
    return NextResponse.json(
      { error: "Error al guardar cotización" },
      { status: 500, headers: corsHeaders }
    )
  }

  return NextResponse.json(data, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)

  const auth = await withAdminAuth(request)
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: corsHeaders }
    )
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100)

  const { data, error } = await supabaseAdmin
    .from("quotes")
    .select("id, total_monthly, payment_terms, agency_count, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener cotizaciones" },
      { status: 500, headers: corsHeaders }
    )
  }

  return NextResponse.json(data, { headers: corsHeaders })
}

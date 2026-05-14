import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getCorsHeaders, handleOptions } from "@/app/api/_middleware/cors"

export const revalidate = 60

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("prices")
      .select("key, value")
      .order("key")

    if (error) throw error

    return NextResponse.json(data, {
      headers: {
        ...getCorsHeaders(request),
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (err) {
    console.error("Error fetching prices:", err)
    return NextResponse.json(
      { error: "Error al obtener precios" },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

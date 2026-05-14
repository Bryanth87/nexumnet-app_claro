import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  const loginUrl = new URL("/admin/login", request.url)
  return NextResponse.redirect(loginUrl, { status: 302 })
}

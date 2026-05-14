import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "admin_session"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Deja pasar la página de login sin verificación
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  // Protege todas las rutas bajo /admin
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE)

    if (!sessionCookie || sessionCookie.value !== process.env.ADMIN_SESSION_SECRET) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

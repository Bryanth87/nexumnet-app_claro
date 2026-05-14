"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createAdminJWT } from "@/lib/jwt-utils"

const SESSION_COOKIE = "admin_session"
const JWT_COOKIE = "admin_token"
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 horas

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string
  const from = (formData.get("from") as string) || "/admin"

  if (password !== process.env.ADMIN_PASSWORD) {
    redirect(`/admin/login?error=1&from=${encodeURIComponent(from)}`)
  }

  // Generar JWT para llamadas a la API
  const jwt = await createAdminJWT()

  const cookieStore = await cookies()

  // Cookie de sesión (para el proxy/middleware)
  cookieStore.set(SESSION_COOKIE, process.env.ADMIN_SESSION_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  // Cookie del JWT (accesible desde el cliente para llamadas fetch al API)
  cookieStore.set(JWT_COOKIE, jwt, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  redirect(from)
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(JWT_COOKIE)
  redirect("/admin/login")
}

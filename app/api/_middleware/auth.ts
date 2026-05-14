import type { NextRequest } from "next/server"
import { verifyAdminJWT } from "@/lib/jwt-utils"

export async function withAdminAuth(
  request: NextRequest
): Promise<{ valid: true; role: string } | { valid: false; status: number; error: string }> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, status: 401, error: "No autorizado" }
  }

  const token = authHeader.slice(7)
  const payload = await verifyAdminJWT(token)

  if (!payload || payload.role !== "admin") {
    return { valid: false, status: 401, error: "Token inválido o expirado" }
  }

  return { valid: true, role: payload.role }
}

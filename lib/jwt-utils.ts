import { SignJWT, jwtVerify } from "jose"

const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET!)

export async function createAdminJWT(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(await getSecret())
}

export async function verifyAdminJWT(
  token: string
): Promise<{ role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, await getSecret())
    return payload as { role: string }
  } catch {
    return null
  }
}

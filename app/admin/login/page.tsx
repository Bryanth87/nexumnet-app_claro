import Image from "next/image"
import { Lock, AlertCircle } from "lucide-react"
import { loginAction } from "./actions"

export const metadata = {
  title: "Acceso Administrador — Cotización Multimedia",
}

interface Props {
  searchParams: Promise<{ error?: string; from?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const hasError = params.error === "1"
  const from = params.from || "/admin"

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Image src="/logo-nexumnet.png" alt="Nexumnet" width={90} height={32} className="object-contain" priority />
          <Image src="/logo-claro.png" alt="Claro" width={90} height={32} className="object-contain" priority />
        </div>
      </header>

      {/* Formulario centrado */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border bg-white shadow-sm p-8 space-y-6">
            {/* Ícono */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <Lock className="h-7 w-7 text-blue-600" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-slate-900">Panel de Administrador</h1>
                <p className="text-sm text-slate-500 mt-1">Ingrese la contraseña para continuar</p>
              </div>
            </div>

            {/* Error */}
            {hasError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Contraseña incorrecta. Intente nuevamente.
              </div>
            )}

            {/* Formulario */}
            <form action={loginAction} className="space-y-4">
              <input type="hidden" name="from" value={from} />
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 text-sm transition"
              >
                Ingresar
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Acceso restringido solo a administradores autorizados.
          </p>
        </div>
      </main>
    </div>
  )
}

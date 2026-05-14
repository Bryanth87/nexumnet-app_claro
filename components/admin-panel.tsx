"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save, RotateCcw, CheckCircle, Settings2, DollarSign, LogOut, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePrices } from "@/components/prices-context"
import type { EquipmentPrices } from "@/lib/prices-storage"
import { DEFAULT_PRICES } from "@/lib/prices-storage"
import { savePricesToServer } from "@/lib/prices-supabase"
import { Separator } from "@/components/ui/separator"

interface PriceRow {
  key: keyof EquipmentPrices
  label: string
  description: string
  category: string
}

const PRICE_ROWS: PriceRow[] = [
  {
    key: "MEDIA_PLAYER",
    label: "Media Player",
    description: "1 por cada grupo de contenido independiente",
    category: "Reproductores",
  },
  {
    key: "MEDIA_PLAYER_LICENSE",
    label: "Licencia Media Player",
    description: "Licencia por cada media player",
    category: "Reproductores",
  },
  {
    key: "SPLITTER_1X2",
    label: "Splitter 1×2",
    description: "Para grupos de 2 televisores",
    category: "Splitters",
  },
  {
    key: "SPLITTER_1X4",
    label: "Splitter 1×4",
    description: "Para grupos de 3 a 4 televisores",
    category: "Splitters",
  },
  {
    key: "SPLITTER_1X8",
    label: "Splitter 1×8",
    description: "Para grupos de 5 a 8 televisores",
    category: "Splitters",
  },
  {
    key: "HDMI_CABLE",
    label: "Cable HDMI",
    description: "1 por televisor",
    category: "Cables HDMI",
  },
  {
    key: "MONTHLY_MAINTENANCE_PER_AGENCY",
    label: "Mantenimiento por Agencia",
    description: "Cuota fija mensual por cada agencia",
    category: "Mantenimiento",
  },
  {
    key: "BANKING_COMMISSION_RATE",
    label: "Comisión Bancaria",
    description: "Porcentaje por mes sobre el costo total",
    category: "Comisiones",
  },
]

function getTokenFromCookie(): string {
  const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ""
}

export function AdminPanel() {
  const { prices, updateAllPrices, resetPrices, refreshPrices } = usePrices()
  const [draft, setDraft] = useState<EquipmentPrices>(() => ({ ...DEFAULT_PRICES, ...prices }))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Sincronizar draft cuando cargan los precios del servidor
  useEffect(() => {
    setDraft({ ...DEFAULT_PRICES, ...prices })
  }, [prices])

  const handleChange = (key: keyof EquipmentPrices, raw: string) => {
    const value = parseFloat(raw)
    if (!isNaN(value) && value >= 0) {
      const clamped = Math.min(value, 99_999)
      const rounded = Math.round(clamped * 100) / 100
      setDraft((prev) => ({ ...prev, [key]: rounded }))
    } else if (raw === "" || raw === "-") {
      setDraft((prev) => ({ ...prev, [key]: 0 }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)

    const token = getTokenFromCookie()
    if (!token) {
      setSaveError("Sesión expirada. Por favor inicia sesión nuevamente.")
      setSaving(false)
      return
    }

    const result = await savePricesToServer(draft, token)

    if (result.success) {
      updateAllPrices(draft)
      await refreshPrices()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setSaveError(result.error ?? "Error al guardar precios")
    }

    setSaving(false)
  }

  const handleReset = () => {
    resetPrices()
    setDraft({ ...prices })
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(prices)

  const categories = [...new Set(PRICE_ROWS.map((r) => r.category))]

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Panel de Administrador</h1>
              <p className="text-xs text-slate-500">Gestión de precios de equipos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a la Cotización
              </Button>
            </Link>
            <form action="/admin/logout" method="POST">
              <Button type="submit" variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-red-600">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Alerta de éxito */}
        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium">Precios actualizados correctamente.</span>
            <span className="text-sm text-green-600">Los cambios ya se reflejan en la cotización del cliente.</span>
          </div>
        )}

        {/* Alerta de error */}
        {saveError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium">{saveError}</span>
          </div>
        )}

        {/* Intro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Tabla de Precios
            </CardTitle>
            <CardDescription>
              Modifique los precios unitarios de cada equipo. Los cambios se guardan en la base de datos y se reflejan
              automáticamente en todas las cotizaciones activas.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tabla de precios por categoría */}
        {categories.map((category) => {
          const rows = PRICE_ROWS.filter((r) => r.category === category)
          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-700">{category}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50 text-xs text-slate-500">
                      <th className="px-6 py-3 text-left font-medium">Equipo</th>
                      <th className="px-6 py-3 text-left font-medium hidden sm:table-cell">Descripción</th>
                      <th className="px-6 py-3 text-right font-medium w-40">Precio (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={row.key}
                        className={idx < rows.length - 1 ? "border-b" : ""}
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{row.label}</span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="text-sm text-slate-500">{row.description}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400 text-sm">$</span>
                            <Input
                              type="number"
                              min={0}
                              max={99999}
                              step={0.01}
                              value={draft[row.key]}
                              onChange={(e) => handleChange(row.key, e.target.value)}
                              className="w-28 text-right font-mono"
                              disabled={saving}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )
        })}

        {/* Acciones */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-sm text-slate-500">
                {hasChanges ? (
                  <span className="text-amber-600 font-medium">Hay cambios sin guardar</span>
                ) : (
                  <span>Los precios están actualizados</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={saving}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restaurar Valores por Defecto
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar Precios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Vista previa de precios actuales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Precios Guardados Actualmente</CardTitle>
            <CardDescription className="text-xs">
              Estos son los precios que el cliente ve en la cotización en este momento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRICE_ROWS.map((row) => (
                <div key={row.key} className="rounded-lg border bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500 truncate">{row.label}</p>
                  <p className="text-base font-bold text-slate-900">${prices[row.key]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-white py-4 text-center text-sm text-slate-400">
        Panel de Administrador — Herramienta de Cotización Multimedia
      </footer>
    </div>
  )
}

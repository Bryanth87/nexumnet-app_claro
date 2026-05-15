"use client"

import { useState } from "react"
import { Download, CreditCard, Calendar, Building2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useQuote } from "@/components/quote-context"
import { usePrices } from "@/components/prices-context"
import { calculateTotalCost, calculateEquipmentSummary } from "@/lib/quote-types"
import { Separator } from "@/components/ui/separator"
import { generateQuotePDF } from "@/lib/generate-pdf"

export function Step3Summary() {
  const { agencies, paymentTerms, setPaymentTerms, setCurrentStep } = useQuote()
  const { prices } = usePrices()
  const [exportingPDF, setExportingPDF] = useState(false)
  const [selectedAgencies, setSelectedAgencies] = useState<Set<string>>(new Set(agencies.map(a => a.id)))

  const { summary, equipmentCost, agencyCount } = calculateTotalCost(agencies, prices)

  const getAgencyCost = (agencyId: string) => {
    const agency = agencies.find(a => a.id === agencyId)
    if (!agency) return 0
    
    const agencySummary = calculateEquipmentSummary([agency])
    const agencyEquipmentCost =
      agencySummary.mediaPlayers * prices.MEDIA_PLAYER +
      agencySummary.splitters1x2 * prices.SPLITTER_1X2 +
      agencySummary.splitters1x4 * prices.SPLITTER_1X4 +
      agencySummary.splitters1x8 * prices.SPLITTER_1X8 +
      agencySummary.hdmiCables * prices.HDMI_CABLE +
      agencySummary.mediaPlayers * prices.MEDIA_PLAYER_LICENSE

    const agencyMaintenance = prices.MONTHLY_MAINTENANCE_PER_AGENCY
    const agencySubtotal = agencyEquipmentCost + agencyMaintenance

    const agencyBankingCommission = (agencySubtotal * prices.BANKING_COMMISSION_RATE * paymentTerms) / 100

    return agencySubtotal + agencyBankingCommission
  }

  const selectedAgenciesCost = Array.from(selectedAgencies).reduce((total, agencyId) => {
    return total + getAgencyCost(agencyId)
  }, 0)

  const monthlyFinalPayment = selectedAgenciesCost / paymentTerms

  const toggleAgency = (agencyId: string) => {
    const newSelected = new Set(selectedAgencies)
    if (newSelected.has(agencyId)) {
      newSelected.delete(agencyId)
    } else {
      newSelected.add(agencyId)
    }
    setSelectedAgencies(newSelected)
  }

  const handleExportPDF = async () => {
    setExportingPDF(true)
    try {
      await generateQuotePDF(agencies, prices, paymentTerms)
    } finally {
      setExportingPDF(false)
    }
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Columna Izquierda - Detalles del Resumen */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Resumen de Cotización
            </CardTitle>
            <CardDescription>
              {agencyCount} {agencyCount === 1 ? "agencia configurada" : "agencias configuradas"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {agencies.map((agency) => (
              <div key={agency.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedAgencies.has(agency.id)}
                      onChange={() => toggleAgency(agency.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <h4 className="font-semibold text-slate-900">{agency.name}</h4>
                  </div>
                  <span className="font-semibold text-blue-600">
                    ${getAgencyCost(agency.id).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 ml-7">
                  {agency.environments.length}{" "}
                  {agency.environments.length === 1 ? "ambiente" : "ambientes"}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-500 ml-7">
                  {agency.environments.map((env) => (
                    <li key={env.id}>
                      • {env.name}: {env.screenCount}{" "}
                      {env.screenCount === 1 ? "televisor" : "televisores"},{" "}
                      {env.mediaPlayerCount}{" "}
                      {env.mediaPlayerCount === 1 ? "media player" : "media players"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Plazo de Financiamiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Plazo de Financiamiento
            </CardTitle>
            <CardDescription>Elija el período de pago en cuotas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Período de Pago</span>
              <span className="text-lg font-semibold text-blue-600">{paymentTerms} meses</span>
            </div>
            <Slider
              value={[paymentTerms]}
              min={1}
              max={36}
              step={1}
              onValueChange={(value) => setPaymentTerms(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>1 mes</span>
              <span>36 meses</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha - Precios */}
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Resumen de Equipos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.mediaPlayers > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Media Players
                </span>
                <span className="font-medium">{summary.mediaPlayers}</span>
              </div>
            )}
            {summary.splitters1x2 > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Splitters 1x2
                </span>
                <span className="font-medium">{summary.splitters1x2}</span>
              </div>
            )}
            {summary.splitters1x4 > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Splitters 1x4
                </span>
                <span className="font-medium">{summary.splitters1x4}</span>
              </div>
            )}
            {summary.splitters1x8 > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Splitters 1x8
                </span>
                <span className="font-medium">{summary.splitters1x8}</span>
              </div>
            )}
            {summary.hdmiCables > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Cables HDMI
                </span>
                <span className="font-medium">{summary.hdmiCables}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Desglose Mensual */}
        <Card className="border-2 border-blue-600">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle>Desglose de Pagos Mensuales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg bg-blue-600 p-4 text-center">
              <p className="text-sm text-blue-100">Total Mensual a Pagar</p>
              <p className="text-3xl font-bold text-white">
                ${monthlyFinalPayment.toFixed(2)}
              </p>
              <p className="text-xs text-blue-200">por mes durante {paymentTerms} meses</p>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
            Paso Anterior
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70"
          >
            {exportingPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

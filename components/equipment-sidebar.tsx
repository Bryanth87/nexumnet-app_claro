"use client"

import { ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuote } from "@/components/quote-context"
import { usePrices } from "@/components/prices-context"
import { calculateTotalCost } from "@/lib/quote-types"
import { Separator } from "@/components/ui/separator"

export function EquipmentSidebar() {
  const { agencies, currentStep } = useQuote()
  const { prices } = usePrices()

  if (currentStep === 1 || agencies.length === 0) {
    return null
  }

  const { summary, equipmentCost } = calculateTotalCost(agencies, prices)

  const hasEquipment = summary.mediaPlayers > 0 || summary.hdmiCables > 0

  if (!hasEquipment) {
    return null
  }

  return (
    <Card className="sticky top-4 border-blue-200 bg-gradient-to-b from-blue-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Estimado de Equipos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {summary.mediaPlayers > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">
              Media Players ({summary.mediaPlayers})
            </span>
            <span className="font-medium">
              ${(summary.mediaPlayers * prices.MEDIA_PLAYER).toLocaleString()}
            </span>
          </div>
        )}
        {summary.splitters1x2 > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">
              Splitters 1x2 ({summary.splitters1x2})
            </span>
            <span className="font-medium">
              ${(summary.splitters1x2 * prices.SPLITTER_1X2).toLocaleString()}
            </span>
          </div>
        )}
        {summary.splitters1x4 > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">
              Splitters 1x4 ({summary.splitters1x4})
            </span>
            <span className="font-medium">
              ${(summary.splitters1x4 * prices.SPLITTER_1X4).toLocaleString()}
            </span>
          </div>
        )}
        {summary.splitters1x8 > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">
              Splitters 1x8 ({summary.splitters1x8})
            </span>
            <span className="font-medium">
              ${(summary.splitters1x8 * prices.SPLITTER_1X8).toLocaleString()}
            </span>
          </div>
        )}
        {summary.hdmiCables > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">
              Cables HDMI ({summary.hdmiCables})
            </span>
            <span className="font-medium">
              ${(summary.hdmiCables * prices.HDMI_CABLE).toLocaleString()}
            </span>
          </div>
        )}

        <Separator className="my-3" />

        <div className="flex justify-between font-semibold text-blue-900">
          <span>Subtotal</span>
          <span>${equipmentCost.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuote } from "@/components/quote-context"
import { useState } from "react"

export function Step1Agencies() {
  const { agencies, setAgencyCount, setCurrentStep } = useQuote()
  const [count, setCount] = useState(agencies.length || 1)

  const handleNext = () => {
    setAgencyCount(count)
    setCurrentStep(2)
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Selección de Agencias</CardTitle>
          <CardDescription>
            ¿Cuántas agencias o sucursales necesita equipar?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount(Math.max(1, count - 1))}
              disabled={count <= 1}
            >
              -
            </Button>
            <Input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center text-lg font-semibold"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount(Math.min(50, count + 1))}
              disabled={count >= 50}
            >
              +
            </Button>
          </div>
          <p className="text-center text-sm text-slate-500">
            {count === 1 ? "1 agencia seleccionada" : `${count} agencias seleccionadas`}
          </p>
          <Button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Siguiente Paso
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

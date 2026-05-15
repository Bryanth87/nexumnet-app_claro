"use client"

import { Monitor, Tv } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useQuote } from "@/components/quote-context"
import { usePrices } from "@/components/prices-context"
import { useState } from "react"
import { getSplitterType } from "@/lib/quote-types"
import { cn } from "@/lib/utils"

export function Step2Environments() {
  const { agencies, setEnvironmentCount, updateEnvironment, updateAgencyName, updateContentGroupScreens, setCurrentStep } = useQuote()
  const [currentAgencyIndex, setCurrentAgencyIndex] = useState(0)

  const currentAgency = agencies[currentAgencyIndex]

  const handlePreviousAgency = () => {
    if (currentAgencyIndex > 0) {
      setCurrentAgencyIndex(currentAgencyIndex - 1)
    } else {
      setCurrentStep(1)
    }
  }

  const handleNextAgency = () => {
    if (currentAgencyIndex < agencies.length - 1) {
      setCurrentAgencyIndex(currentAgencyIndex + 1)
    } else {
      setCurrentStep(3)
    }
  }

  if (!currentAgency) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-600">No hay agencias configuradas. Por favor regrese.</p>
        <Button onClick={() => setCurrentStep(1)} className="ml-4">
          Regresar
        </Button>
      </div>
    )
  }

  const envCount = currentAgency.environments.length

  return (
    <div className="space-y-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg">
            <span className="text-slate-600 text-sm sm:text-base">Agencia {currentAgencyIndex + 1} de {agencies.length}:</span>
            <Input
              value={currentAgency.name}
              onChange={(e) => updateAgencyName(currentAgency.id, e.target.value)}
              className="max-w-xs text-lg font-semibold w-full sm:w-auto"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ¿Cuántos ambientes tiene esta agencia?
            </label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEnvironmentCount(currentAgency.id, Math.max(1, envCount - 1))}
                disabled={envCount <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                min={1}
                max={10}
                value={envCount}
                onChange={(e) => setEnvironmentCount(currentAgency.id, Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEnvironmentCount(currentAgency.id, Math.min(10, envCount + 1))}
                disabled={envCount >= 10}
              >
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentAgency.environments.map((env, envIndex) => (
        <EnvironmentCard
          key={env.id}
          agencyId={currentAgency.id}
          environment={env}
          envIndex={envIndex}
          updateEnvironment={updateEnvironment}
          updateContentGroupScreens={updateContentGroupScreens}
        />
      ))}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handlePreviousAgency}>
          {currentAgencyIndex > 0 ? "Agencia Anterior" : "Paso Anterior"}
        </Button>
        <Button onClick={handleNextAgency} className="bg-blue-600 hover:bg-blue-700 text-white">
          {currentAgencyIndex < agencies.length - 1 ? "Siguiente Agencia" : "Siguiente Paso (Resumen)"}
        </Button>
      </div>
    </div>
  )
}

interface EnvironmentCardProps {
  agencyId: string
  environment: {
    id: string
    name: string
    screenCount: number
    mediaPlayerCount: number
    contentGroups: { id: string; screenCount: number }[]
  }
  envIndex: number
  updateEnvironment: (agencyId: string, envId: string, updates: Partial<typeof environment>) => void
  updateContentGroupScreens: (agencyId: string, envId: string, groupId: string, screenCount: number) => void
}

function EnvironmentCard({
  agencyId,
  environment,
  envIndex,
  updateEnvironment,
  updateContentGroupScreens,
}: EnvironmentCardProps) {
  const { prices } = usePrices()
  const screenOptions = [1, 2, 3, 4, 5, 6, 7]
  const mediaPlayerOptions = [1, 2, 3, 4]

  const handleSliderChange = (groupIndex: number, newValue: number[]) => {
    const group = environment.contentGroups[groupIndex]
    updateContentGroupScreens(agencyId, environment.id, group.id, newValue[0])
  }

  const getSplitterLabel = (screenCount: number): string => {
    const splitter = getSplitterType(screenCount)
    if (!splitter) return ""
    if (splitter.type === "1x2") return `Splitter 1x2 ($${prices.SPLITTER_1X2})`
    if (splitter.type === "1x4") return `Splitter 1x4 ($${prices.SPLITTER_1X4})`
    return `Splitter 1x8 ($${prices.SPLITTER_1X8})`
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-blue-900">
          Ambiente {envIndex + 1}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nombre del Ambiente */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nombre del Ambiente
          </label>
          <Input
            value={environment.name}
            onChange={(e) =>
              updateEnvironment(agencyId, environment.id, { name: e.target.value })
            }
            placeholder="Ej: Lobby, Sala de Espera, Salón Principal"
          />
        </div>

        {/* Número de Pantallas */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Número de Televisores
          </label>
          <div className="flex gap-2">
            {screenOptions.map((num) => (
              <Button
                key={num}
                variant={environment.screenCount === num ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateEnvironment(agencyId, environment.id, { screenCount: num })
                }
                className={cn(
                  "w-10",
                  environment.screenCount === num && "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {num}
              </Button>
            ))}
            <Button
              variant={environment.screenCount === 8 ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateEnvironment(agencyId, environment.id, { screenCount: 8 })
              }
              className={cn(
                "w-10",
                environment.screenCount === 8 && "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              8
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {Array.from({ length: environment.screenCount }).map((_, i) => (
              <Monitor key={i} className="h-6 w-6 text-slate-600" />
            ))}
          </div>
        </div>

        {/* Grupos de Contenido Independiente (Media Players) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Grupos de Contenido Independiente (Media Players)
          </label>
          <p className="mb-2 text-xs text-slate-500">
            Cada grupo reproduce contenido diferente y requiere 1 Media Player (${prices.MEDIA_PLAYER} c/u)
          </p>
          <div className="flex gap-2">
            {mediaPlayerOptions.map((num) => (
              <Button
                key={num}
                variant={environment.mediaPlayerCount === num ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateEnvironment(agencyId, environment.id, { mediaPlayerCount: num })
                }
                className={cn(
                  "w-10",
                  environment.mediaPlayerCount === num && "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        {/* Distribución de Pantallas por Grupo */}
        {environment.mediaPlayerCount > 1 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="mb-4 text-sm font-medium text-slate-700">
              Distribución de Televisores por Grupo
            </h4>
            <div className="space-y-4">
              {environment.contentGroups.map((group, groupIndex) => {
                const splitter = getSplitterType(group.screenCount)
                return (
                  <div key={group.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Contenido {groupIndex + 1}
                      </span>
                      <span className="text-sm text-slate-500">
                        {group.screenCount}/{environment.screenCount} TVs
                      </span>
                    </div>
                    <Slider
                      value={[group.screenCount]}
                      min={1}
                      max={environment.screenCount - (environment.contentGroups.length - 1)}
                      step={1}
                      onValueChange={(value) => handleSliderChange(groupIndex, value)}
                      className="w-full"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: group.screenCount }).map((_, i) => (
                          <Tv key={i} className="h-5 w-5 text-blue-600" />
                        ))}
                      </div>
                      <span className="ml-auto text-xs text-slate-500">
                        1 Media Player
                        {splitter && `, ${getSplitterLabel(group.screenCount)}`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

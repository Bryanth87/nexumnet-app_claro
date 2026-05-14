// Types for the multimedia quoting tool
import { type EquipmentPrices, DEFAULT_PRICES } from "@/lib/prices-storage"

export type { EquipmentPrices }
export { DEFAULT_PRICES }

export interface ContentGroup {
  id: string
  screenCount: number
}

export interface Environment {
  id: string
  name: string
  screenCount: number
  mediaPlayerCount: number
  contentGroups: ContentGroup[]
}

export interface Agency {
  id: string
  name: string
  environments: Environment[]
}

export interface QuoteState {
  agencies: Agency[]
  currentStep: number
  paymentTerms: number
}

// Utility functions
export function generateId(): string {
  return crypto.randomUUID()
}

export function getSplitterType(screenCount: number): { type: string } | null {
  if (screenCount <= 1) return null
  if (screenCount <= 2) return { type: "1x2" }
  if (screenCount <= 4) return { type: "1x4" }
  return { type: "1x8" }
}

export function calculateEquipmentSummary(agencies: Agency[]) {
  let mediaPlayers = 0
  let splitters1x2 = 0
  let splitters1x4 = 0
  let splitters1x8 = 0
  let hdmiCables = 0

  agencies.forEach((agency) => {
    agency.environments.forEach((env) => {
      mediaPlayers += env.mediaPlayerCount

      env.contentGroups.forEach((group) => {
        hdmiCables += group.screenCount

        const splitter = getSplitterType(group.screenCount)
        if (splitter) {
          if (splitter.type === "1x2") splitters1x2++
          else if (splitter.type === "1x4") splitters1x4++
          else if (splitter.type === "1x8") splitters1x8++
        }
      })
    })
  })

  return {
    mediaPlayers,
    splitters1x2,
    splitters1x4,
    splitters1x8,
    hdmiCables,
  }
}

export function calculateTotalCost(
  agencies: Agency[],
  prices: EquipmentPrices = DEFAULT_PRICES
) {
  const summary = calculateEquipmentSummary(agencies)

  const equipmentCost =
    summary.mediaPlayers * prices.MEDIA_PLAYER +
    summary.splitters1x2 * prices.SPLITTER_1X2 +
    summary.splitters1x4 * prices.SPLITTER_1X4 +
    summary.splitters1x8 * prices.SPLITTER_1X8 +
    summary.hdmiCables * prices.HDMI_CABLE +
    summary.mediaPlayers * prices.MEDIA_PLAYER_LICENSE

  return {
    summary,
    equipmentCost,
    agencyCount: agencies.length,
  }
}

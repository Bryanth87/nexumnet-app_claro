const STORAGE_KEY = "app_claro_equipment_prices"

export interface EquipmentPrices {
  MEDIA_PLAYER: number
  SPLITTER_1X2: number
  SPLITTER_1X4: number
  SPLITTER_1X8: number
  HDMI_CABLE: number
  MONTHLY_MAINTENANCE_PER_AGENCY: number
  MEDIA_PLAYER_LICENSE: number
  BANKING_COMMISSION_RATE: number
}

export const DEFAULT_PRICES: EquipmentPrices = {
  MEDIA_PLAYER: 350,
  SPLITTER_1X2: 25,
  SPLITTER_1X4: 45,
  SPLITTER_1X8: 75,
  HDMI_CABLE: 15,
  MONTHLY_MAINTENANCE_PER_AGENCY: 30,
  MEDIA_PLAYER_LICENSE: 7,
  BANKING_COMMISSION_RATE: 1,
}

export function loadPrices(): EquipmentPrices {
  if (typeof window === "undefined") return DEFAULT_PRICES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PRICES
    const parsed = JSON.parse(raw) as Partial<EquipmentPrices>
    return { ...DEFAULT_PRICES, ...parsed }
  } catch {
    return DEFAULT_PRICES
  }
}

export function savePrices(prices: EquipmentPrices): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prices))
}

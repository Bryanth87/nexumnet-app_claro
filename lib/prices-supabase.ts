import type { EquipmentPrices } from "@/lib/prices-storage"

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

export async function loadPricesFromServer(): Promise<EquipmentPrices> {
  try {
    const res = await fetch("/api/prices", {
      cache: "no-store",
    })

    if (!res.ok) throw new Error("Failed to fetch prices")

    const data: { key: string; value: number }[] = await res.json()

    if (!data || data.length === 0) return DEFAULT_PRICES

    return data.reduce((acc, { key, value }) => {
      acc[key as keyof EquipmentPrices] = Number(value)
      return acc
    }, {} as EquipmentPrices)
  } catch {
    return DEFAULT_PRICES
  }
}

export async function savePricesToServer(
  prices: EquipmentPrices,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/prices/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prices }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.error ?? "Error al guardar precios" }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Error de conexión" }
  }
}

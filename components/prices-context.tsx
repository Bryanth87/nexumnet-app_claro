"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { type EquipmentPrices, DEFAULT_PRICES } from "@/lib/prices-storage"
import { loadPricesFromServer } from "@/lib/prices-supabase"

interface PricesContextType {
  prices: EquipmentPrices
  loading: boolean
  updatePrice: (key: keyof EquipmentPrices, value: number) => void
  updateAllPrices: (newPrices: EquipmentPrices) => void
  resetPrices: () => void
  refreshPrices: () => Promise<void>
}

const PricesContext = createContext<PricesContextType | undefined>(undefined)

export function PricesProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<EquipmentPrices>(DEFAULT_PRICES)
  const [loading, setLoading] = useState(true)

  const refreshPrices = useCallback(async () => {
    setLoading(true)
    try {
      const fetched = await loadPricesFromServer()
      setPrices(fetched)
    } catch {
      // Mantiene DEFAULT_PRICES si falla
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshPrices()
  }, [refreshPrices])

  // Actualización local optimista (sin persistencia — el admin usa savePricesToServer)
  const updatePrice = (key: keyof EquipmentPrices, value: number) => {
    setPrices((prev) => ({ ...prev, [key]: value }))
  }

  const updateAllPrices = (newPrices: EquipmentPrices) => {
    setPrices(newPrices)
  }

  const resetPrices = () => {
    setPrices(DEFAULT_PRICES)
  }

  return (
    <PricesContext.Provider
      value={{ prices, loading, updatePrice, updateAllPrices, resetPrices, refreshPrices }}
    >
      {children}
    </PricesContext.Provider>
  )
}

export function usePrices() {
  const context = useContext(PricesContext)
  if (!context) {
    throw new Error("usePrices debe usarse dentro de un PricesProvider")
  }
  return context
}

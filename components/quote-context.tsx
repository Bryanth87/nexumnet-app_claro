"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Agency, Environment, ContentGroup, QuoteState } from "@/lib/quote-types"
import { generateId } from "@/lib/quote-types"

interface QuoteContextType extends QuoteState {
  setCurrentStep: (step: number) => void
  setAgencyCount: (count: number) => void
  updateAgencyName: (agencyId: string, name: string) => void
  setEnvironmentCount: (agencyId: string, count: number) => void
  updateEnvironment: (agencyId: string, environmentId: string, updates: Partial<Environment>) => void
  updateContentGroupScreens: (
    agencyId: string,
    environmentId: string,
    groupId: string,
    screenCount: number
  ) => void
  setPaymentTerms: (terms: number) => void
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined)

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuoteState>({
    agencies: [],
    currentStep: 1,
    paymentTerms: 12,
  })

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }))
  }

  const setAgencyCount = (count: number) => {
    setState((prev) => {
      const currentCount = prev.agencies.length
      if (count > currentCount) {
        const newAgencies: Agency[] = Array.from({ length: count - currentCount }, (_, i) => ({
          id: generateId(),
          name: `Agencia ${currentCount + i + 1}`,
          environments: [
            {
              id: generateId(),
              name: "Ambiente 1",
              screenCount: 1,
              mediaPlayerCount: 1,
              contentGroups: [{ id: generateId(), screenCount: 1 }],
            },
          ],
        }))
        return { ...prev, agencies: [...prev.agencies, ...newAgencies] }
      } else {
        return { ...prev, agencies: prev.agencies.slice(0, count) }
      }
    })
  }

  const updateAgencyName = (agencyId: string, name: string) => {
    setState((prev) => ({
      ...prev,
      agencies: prev.agencies.map((agency) =>
        agency.id === agencyId ? { ...agency, name } : agency
      ),
    }))
  }

  const setEnvironmentCount = (agencyId: string, count: number) => {
    setState((prev) => ({
      ...prev,
      agencies: prev.agencies.map((agency) => {
        if (agency.id !== agencyId) return agency

        const currentCount = agency.environments.length
        if (count > currentCount) {
          const newEnvironments: Environment[] = Array.from(
            { length: count - currentCount },
            (_, i) => ({
              id: generateId(),
              name: `Ambiente ${currentCount + i + 1}`,
              screenCount: 1,
              mediaPlayerCount: 1,
              contentGroups: [{ id: generateId(), screenCount: 1 }],
            })
          )
          return { ...agency, environments: [...agency.environments, ...newEnvironments] }
        } else {
          return { ...agency, environments: agency.environments.slice(0, count) }
        }
      }),
    }))
  }

  const updateEnvironment = (
    agencyId: string,
    environmentId: string,
    updates: Partial<Environment>
  ) => {
    setState((prev) => ({
      ...prev,
      agencies: prev.agencies.map((agency) => {
        if (agency.id !== agencyId) return agency
        return {
          ...agency,
          environments: agency.environments.map((env) => {
            if (env.id !== environmentId) return env

            let updatedEnv = { ...env, ...updates }

            if (updates.mediaPlayerCount !== undefined) {
              const newGroupCount = updates.mediaPlayerCount
              const currentGroups = env.contentGroups

              if (newGroupCount > currentGroups.length) {
                const screensPerGroup = Math.floor(updatedEnv.screenCount / newGroupCount)
                const remainder = updatedEnv.screenCount % newGroupCount

                const newGroups: ContentGroup[] = Array.from({ length: newGroupCount }, (_, i) => ({
                  id: i < currentGroups.length ? currentGroups[i].id : generateId(),
                  screenCount: screensPerGroup + (i < remainder ? 1 : 0),
                }))
                updatedEnv.contentGroups = newGroups
              } else {
                const keptGroups = currentGroups.slice(0, newGroupCount)
                const screensPerGroup = Math.floor(updatedEnv.screenCount / newGroupCount)
                const remainder = updatedEnv.screenCount % newGroupCount

                updatedEnv.contentGroups = keptGroups.map((group, i) => ({
                  ...group,
                  screenCount: screensPerGroup + (i < remainder ? 1 : 0),
                }))
              }
            }

            if (updates.screenCount !== undefined) {
              const newScreenCount = updates.screenCount
              const groupCount = updatedEnv.contentGroups.length
              const screensPerGroup = Math.floor(newScreenCount / groupCount)
              const remainder = newScreenCount % groupCount

              updatedEnv.contentGroups = updatedEnv.contentGroups.map((group, i) => ({
                ...group,
                screenCount: screensPerGroup + (i < remainder ? 1 : 0),
              }))
            }

            return updatedEnv
          }),
        }
      }),
    }))
  }

  const updateContentGroupScreens = (
    agencyId: string,
    environmentId: string,
    groupId: string,
    newScreenCount: number
  ) => {
    setState((prev) => ({
      ...prev,
      agencies: prev.agencies.map((agency) => {
        if (agency.id !== agencyId) return agency
        return {
          ...agency,
          environments: agency.environments.map((env) => {
            if (env.id !== environmentId) return env

            const totalScreens = env.screenCount
            const otherGroups = env.contentGroups.filter((g) => g.id !== groupId)

            // Each other group must have at least 1 screen
            const maxAllowed = totalScreens - otherGroups.length
            const clamped = Math.min(Math.max(1, newScreenCount), maxAllowed)

            // Distribute remaining screens among the other groups
            const remaining = totalScreens - clamped
            const basePerGroup = Math.floor(remaining / otherGroups.length)
            const extra = remaining % otherGroups.length

            let otherIdx = 0
            const newGroups = env.contentGroups.map((group) => {
              if (group.id === groupId) return { ...group, screenCount: clamped }
              const bonus = otherIdx < extra ? 1 : 0
              otherIdx++
              return { ...group, screenCount: basePerGroup + bonus }
            })

            return { ...env, contentGroups: newGroups }
          }),
        }
      }),
    }))
  }

  const setPaymentTerms = (terms: number) => {
    setState((prev) => ({ ...prev, paymentTerms: terms }))
  }

  return (
    <QuoteContext.Provider
      value={{
        ...state,
        setCurrentStep,
        setAgencyCount,
        updateAgencyName,
        setEnvironmentCount,
        updateEnvironment,
        updateContentGroupScreens,
        setPaymentTerms,
      }}
    >
      {children}
    </QuoteContext.Provider>
  )
}

export function useQuote() {
  const context = useContext(QuoteContext)
  if (!context) {
    throw new Error("useQuote debe usarse dentro de un QuoteProvider")
  }
  return context
}

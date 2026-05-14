"use client"

import Link from "next/link"
import Image from "next/image"
import { Settings } from "lucide-react"
import { QuoteProvider, useQuote } from "@/components/quote-context"
import { StepIndicator } from "@/components/step-indicator"
import { Step1Agencies } from "@/components/step1-agencies"
import { Step2Environments } from "@/components/step2-environments"
import { Step3Summary } from "@/components/step3-summary"
import { EquipmentSidebar } from "@/components/equipment-sidebar"

const STEPS = [
  { number: 1, title: "Agencias" },
  { number: 2, title: "Ambientes" },
  { number: 3, title: "Resumen y Financiamiento" },
]

function QuoteWizardContent() {
  const { currentStep } = useQuote()

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* Logo Empresa (Nexumnet) */}
          <div className="flex flex-col items-center gap-1">
            <Image
              src="/logo-nexumnet.png"
              alt="Nexumnet"
              width={90}
              height={32}
              className="object-contain"
              priority
            />
            <span className="text-xs text-slate-400">Nexumnet</span>
          </div>

          {/* Indicador de Pasos - Escritorio */}
          <div className="hidden md:block">
            <StepIndicator currentStep={currentStep} steps={STEPS} />
          </div>

          {/* Logo Cliente (Claro) */}
          <div className="flex flex-col items-center gap-1">
            <Image
              src="/logo-claro.png"
              alt="Claro"
              width={90}
              height={32}
              className="object-contain"
              priority
            />
            <span className="text-xs text-slate-400">Claro</span>
          </div>
        </div>

        {/* Indicador de Pasos - Móvil */}
        <div className="border-t md:hidden">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {currentStep === 2 ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div>
              <Step2Environments />
            </div>
            <div className="hidden lg:block">
              <EquipmentSidebar />
            </div>
          </div>
        ) : (
          <div>
            {currentStep === 1 && <Step1Agencies />}
            {currentStep === 3 && <Step3Summary />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-4">
          <span>Herramienta de Cotización Multimedia &copy; {new Date().getFullYear()}</span>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Settings className="h-3 w-3" />
            Administrador
          </Link>
        </div>
      </footer>
    </div>
  )
}

export function QuoteWizard() {
  return (
    <QuoteProvider>
      <QuoteWizardContent />
    </QuoteProvider>
  )
}

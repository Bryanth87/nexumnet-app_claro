"use client"

import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  steps: { number: number; title: string }[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                currentStep > step.number
                  ? "bg-blue-600 text-white"
                  : currentStep === step.number
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
              )}
            >
              {currentStep > step.number ? (
                <Check className="h-4 w-4" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                currentStep >= step.number ? "text-slate-900" : "text-slate-400"
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <ChevronRight className="mx-2 h-4 w-4 text-slate-400" />
          )}
        </div>
      ))}
    </div>
  )
}

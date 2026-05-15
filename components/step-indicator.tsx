"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  title: string
}

interface StepIndicatorProps {
  currentStep: number
  steps: Step[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number
        const isCurrent = currentStep === step.number

        return (
          <div key={step.number} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                  isCompleted && "bg-blue-600 text-white",
                  isCurrent && "bg-blue-600 text-white",
                  !isCompleted && !isCurrent && "bg-slate-200 text-slate-500"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  (isCompleted || isCurrent) ? "text-blue-600" : "text-slate-400"
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-px w-6",
                  isCompleted ? "bg-blue-600" : "bg-slate-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

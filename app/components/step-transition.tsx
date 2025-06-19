"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "./loading-spinner"

interface StepTransitionProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export function StepTransition({ title, description, icon }: StepTransitionProps) {
  return (
    <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">{icon || <LoadingSpinner size="lg" />}</div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">{title}</h3>
        <p className="text-blue-700 max-w-md">{description}</p>
      </CardContent>
    </Card>
  )
}

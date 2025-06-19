"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  className?: string
}

export function ProgressBar({ current, total, label, className = "" }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>{label}</span>
          <span>
            {current}/{total}
          </span>
        </div>
      )}
      <Progress value={percentage} className="h-2" />
      <div className="text-xs text-gray-500 text-center">{percentage}% complete</div>
    </div>
  )
}
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface UsageLimitCardProps {
  currentUsage: number
  maxUsage: number
}

export function UsageLimitCard({ currentUsage, maxUsage }: UsageLimitCardProps) {
  const percentage = (currentUsage / maxUsage) * 100
  const remaining = maxUsage - currentUsage

  return (
    <Card
      className={`${remaining === 0 ? "border-red-200 bg-red-50" : remaining <= 2 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {remaining === 0 ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : remaining <= 2 ? (
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
          Research Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>
              Used: {currentUsage}/{maxUsage}
            </span>
            <span
              className={`font-medium ${remaining === 0 ? "text-red-600" : remaining <= 2 ? "text-yellow-600" : "text-green-600"}`}
            >
              {remaining} remaining
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          {remaining === 0 && (
            <p className="text-xs text-red-600">
              You've reached your research limit. Contact support to increase your quota.
            </p>
          )}
          {remaining <= 2 && remaining > 0 && (
            <p className="text-xs text-yellow-600">You're running low on research credits. Use them wisely!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

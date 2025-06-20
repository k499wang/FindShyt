"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Globe, Zap } from "lucide-react"
import { ProgressBar } from "./progress-bar"
import { LoadingSpinner } from "./loading-spinner"
import { Warning } from "postcss"

interface ScrapeStatus {
  url: string
  status: "pending" | "scraping" | "completed" | "error"
  title?: string
  wordCount?: number
  error?: string
}

interface ScrapingStatusProps {
  scrapeStatuses: ScrapeStatus[]
  isActive: boolean
}

export function ScrapingStatus({ scrapeStatuses, isActive }: ScrapingStatusProps) {
  const completedCount = scrapeStatuses.filter((s) => s.status === "completed").length
  const errorCount = scrapeStatuses.filter((s) => s.status === "error").length
  const scrapingCount = scrapeStatuses.filter((s) => s.status === "scraping").length
  const totalCount = scrapeStatuses.length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "scraping":
        return <LoadingSpinner size="sm" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "scraping":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  if (!isActive && scrapeStatuses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Parallel Web Scraping
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {scrapingCount > 0 ? `${scrapingCount} active` : `${completedCount}/${totalCount} completed`}
          </Badge>

          <Badge variant="secondary" className="ml-2">
            WARNING: Please do not exit the app while scraping is in progress.
          </Badge>
         
            
          {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
        </CardTitle>
        {scrapingCount > 0 && (
          <p className="text-sm text-blue-600 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            Scraping {scrapingCount} websites simultaneously ...
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ProgressBar current={completedCount + errorCount} total={totalCount} label="Overall Progress" />

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scrapeStatuses.map((scrape, index) => (
              <div key={index} className={`p-3 rounded-lg border transition-all ${getStatusColor(scrape.status)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(scrape.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{scrape.title || "Extracting content..."}</span>
                      {scrape.wordCount && (
                        <Badge variant="secondary" className="text-xs">
                          {scrape.wordCount} words
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{scrape.url}</p>
                    {scrape.error && <p className="text-xs text-red-600 mt-1">{scrape.error}</p>}
                    {scrape.status === "scraping" && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          Processing...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {scrapingCount === 0 && completedCount > 0 && (
            <div className="text-center py-4 space-y-2">
              <Badge variant="outline" className="text-green-600 border-green-200 text-base px-4 py-2">
                ✓ All scraping completed successfully
              </Badge>
              <p className="text-sm text-gray-600">Review the results and continue when ready</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
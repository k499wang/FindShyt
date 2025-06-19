"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Eye, FileText, Globe, ChevronDown, ChevronRight, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ScrapedData {
  url: string
  title: string
  content: string
  metadata: {
    scrapedAt: string
    wordCount: number
    domain: string
    error?: boolean
  }
}

interface ScrapingCompleteProps {
  scrapedContent: {
    scrapedData: ScrapedData[]
  }
  onContinue: () => void
  onBack: () => void
}

export function ScrapingComplete({ scrapedContent, onContinue, onBack }: ScrapingCompleteProps) {
  const [showPreview, setShowPreview] = useState(true)
  const [selectedPreview, setSelectedPreview] = useState<number | null>(null)
  const [expandedPreviews, setExpandedPreviews] = useState<Set<number>>(new Set())

  const successfulScrapes = scrapedContent.scrapedData.filter((data) => !data.metadata.error)
  const failedScrapes = scrapedContent.scrapedData.filter((data) => data.metadata.error)
  const totalWords = successfulScrapes.reduce((sum, data) => sum + data.metadata.wordCount, 0)

  // Auto-expand all previews when component mounts
  useEffect(() => {
    if (successfulScrapes.length > 0) {
      setExpandedPreviews(new Set(Array.from({ length: successfulScrapes.length }, (_, i) => i)))
    }
  }, [successfulScrapes.length])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Scraping Complete!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Successful</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{successfulScrapes.length}</div>
              <div className="text-sm text-green-700">websites scraped</div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Content</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{totalWords.toLocaleString()}</div>
              <div className="text-sm text-blue-700">words extracted</div>
            </div>

            {failedScrapes.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Failed</span>
                </div>
                <div className="text-2xl font-bold text-red-900">{failedScrapes.length}</div>
                <div className="text-sm text-red-700">websites failed</div>
              </div>
            )}
          </div>

          {/* Content Preview Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Scraped Content</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? "Hide Content Preview" : "Show Content Preview"}
            </Button>
          </div>

          {/* Content Preview */}
          {showPreview && (
            <div className="space-y-3">
              <ScrollArea className="h-96 border rounded-lg p-4">
                {successfulScrapes.map((data, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">

                        {expandedPreviews.has(index) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {data.title}
                      <Badge variant="secondary" className="text-xs">
                        {data.metadata.wordCount} words
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{data.url}</p>
                    {expandedPreviews.has(index) && (
                      <div className="bg-gray-50 p-3 rounded text-sm border-l-4 border-blue-200">
                        <p className="whitespace-pre-wrap">
                          {data.content.substring(0, 1000)}
                          {data.content.length > 1000 && "..."}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Quality Check */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Content Quality Check</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center justify-between">
                <span>Websites successfully scraped:</span>
                <Badge variant="outline" className="text-blue-700">
                  {successfulScrapes.length}/{scrapedContent.scrapedData.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Average content per site:</span>
                <Badge variant="outline" className="text-blue-700">
                  {successfulScrapes.length > 0 ? Math.round(totalWords / successfulScrapes.length) : 0} words
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Content quality:</span>
                <Badge
                  variant="outline"
                  className={
                    totalWords > 1000
                      ? "text-green-700 border-green-300"
                      : totalWords > 500
                        ? "text-yellow-700 border-yellow-300"
                        : "text-red-700 border-red-300"
                  }
                >
                  {totalWords > 1000 ? "Excellent" : totalWords > 500 ? "Good" : "Limited"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack}>
              ← Back to Link Selection
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">Ready to generate AI templates from this content?</div>
              <Button onClick={onContinue} className="flex items-center gap-2">
                Continue to Templates
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

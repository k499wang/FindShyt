"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Globe, Check } from "lucide-react"

interface SearchResult {
  title: string
  link: string
  description: string
}

interface LinkSelectorProps {
  searchResults: SearchResult[]
  selectedUrls: string[]
  onUrlToggle: (url: string) => void
  onConfirm: () => void
}

export function LinkSelector({ searchResults, selectedUrls, onUrlToggle, onConfirm }: LinkSelectorProps) {
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : []
  const safeSelectedUrls = Array.isArray(selectedUrls) ? selectedUrls : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Select Links to Scrape
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Choose which websites to scrape for information:</p>
            <Badge variant="outline">{safeSelectedUrls.length} selected</Badge>
          </div>

          <div className="space-y-3">
            {safeSearchResults.map((result, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  safeSelectedUrls.includes(result.link) ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => onUrlToggle(result.link)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={safeSelectedUrls.includes(result.link)}
                      onChange={() => onUrlToggle(result.link)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm">{result.title || "Untitled"}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(result.link, "_blank")
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{result.description || "No description available"}</p>
                      <p className="text-xs text-blue-600 truncate">{result.link || ""}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={onConfirm} disabled={safeSelectedUrls.length === 0} className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Scrape Selected Links ({safeSelectedUrls.length})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

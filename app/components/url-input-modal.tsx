"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, AlertCircle, Check, Palette } from "lucide-react" // Added Palette icon
import { LoadingSpinner } from "./loading-spinner"

interface UrlInputModalProps {
  isOpen: boolean
  onClose: () => void
  onUrlSubmit: (url: string, scrapedData: any) => void
}

export function UrlInputModal({ isOpen, onClose, onUrlSubmit }: UrlInputModalProps) {
  const [url, setUrl] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false) // Renamed from isScraping
  const [error, setError] = useState("")
  const [validationResult, setValidationResult] = useState<any>(null) // Basic URL validation result
  const [scrapedStyleResult, setScrapedStyleResult] = useState<any>(null) // Detailed style analysis result

  const validateUrl = (inputUrl: string): boolean => {
    try {
      const urlObj = new URL(inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`)
      return ["http:", "https:"].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    setError("")
    setValidationResult(null)
    setScrapedStyleResult(null) // Clear style result on URL change
  }

  const handleValidateUrl = async () => {
    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL (e.g., google.com or https://example.com)")
      return
    }

    setIsValidating(true)
    setError("")
    setValidationResult(null) // Clear previous validation result
    setScrapedStyleResult(null) // Clear previous style result

    try {
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`

      const response = await fetch("/api/validate-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "URL validation failed")
      }

      setValidationResult({
        url: normalizedUrl,
        title: data.title || "Website",
        accessible: true,
      })
    } catch (error) {
      console.error("URL validation error:", error)
      setError(error instanceof Error ? error.message : "Failed to validate URL")
    } finally {
      setIsValidating(false)
    }
  }

  const handleAnalyzeStyle = async () => {
    if (!validationResult || isAnalyzingStyle) return

    setIsAnalyzingStyle(true)
    setError("")
    setScrapedStyleResult(null) // Clear previous style result

    try {
      const response = await fetch("/api/scrape-for-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: validationResult.url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze website style")
      }

      setScrapedStyleResult(data)
    } catch (error) {
      console.error("Style analysis error:", error)
      setError(error instanceof Error ? error.message : "Failed to analyze website style")
    } finally {
      setIsAnalyzingStyle(false)
    }
  }

  const handleSubmitAndClose = () => {
    if (!scrapedStyleResult) return // Should not happen if button is enabled correctly
    onUrlSubmit(scrapedStyleResult.url, scrapedStyleResult)
    handleClose()
  }

  const handleClose = () => {
    setUrl("")
    setError("")
    setValidationResult(null)
    setScrapedStyleResult(null)
    setIsValidating(false)
    setIsAnalyzingStyle(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Enter Website URL
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Website URL to analyze</label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="google.com or https://example.com"
                disabled={isValidating || isAnalyzingStyle}
                onKeyDown={(e) => e.key === "Enter" && !validationResult && handleValidateUrl()}
              />
              {!validationResult && (
                <Button onClick={handleValidateUrl} disabled={isValidating || !url.trim()} size="sm">
                  {isValidating ? <LoadingSpinner size="sm" /> : "Check"}
                </Button>
              )}
              {validationResult && !scrapedStyleResult && (
                <Button onClick={handleAnalyzeStyle} disabled={isAnalyzingStyle} size="sm">
                  {isAnalyzingStyle ? <LoadingSpinner size="sm" /> : "Analyze Style"}
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {validationResult && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">{validationResult.title}</h4>
                    <p className="text-sm text-green-700 break-all">{validationResult.url}</p>
                    <p className="text-xs text-green-600 mt-1">✓ URL is accessible</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {scrapedStyleResult && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Analyzed Style Preview
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-700">Primary Color:</span>
                    <div
                      className="w-6 h-6 rounded-full border border-blue-300"
                      style={{ backgroundColor: scrapedStyleResult.colors.primary }}
                    ></div>
                    <span className="text-sm font-mono text-blue-700">{scrapedStyleResult.colors.primary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-700">Text Color:</span>
                    <div
                      className="w-6 h-6 rounded-full border border-blue-300"
                      style={{ backgroundColor: scrapedStyleResult.colors.text }}
                    ></div>
                    <span className="text-sm font-mono text-blue-700">{scrapedStyleResult.colors.text}</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Font:{" "}
                    <span style={{ fontFamily: scrapedStyleResult.fonts.primary }}>
                      {scrapedStyleResult.fonts.primary.split(",")[0]}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  This style will be used to generate your custom login page.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isAnalyzingStyle}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAndClose}
              disabled={!scrapedStyleResult || isAnalyzingStyle}
              className="flex items-center gap-2"
            >
              {isAnalyzingStyle ? (
                <>
                  <LoadingSpinner size="sm" />
                  Analyzing Style...
                </>
              ) : (
                "Confirm & Continue"
              )}
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              We'll analyze the website's design, colors, typography, and layout to create a login page in the same
              style.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )
}

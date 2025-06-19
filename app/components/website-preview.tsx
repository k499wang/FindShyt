"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Eye, EyeOff } from "lucide-react"

interface WebsitePreviewProps {
  url: string
  fullUrl: string
}

export function WebsitePreview({ url, fullUrl }: WebsitePreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Generated Login Page</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fullUrl, "_blank")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Login Page
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Login Page URL:</p>
            <code className="text-sm font-mono">{fullUrl}</code>
          </div>

          {showPreview && (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={url}
                className="w-full h-96"
                title="Generated Website Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Palette, Mail, Code } from "lucide-react"

interface StyleSelectorProps {
  selectedEmailStyle: string
  selectedWebsiteStyle: string
  onEmailStyleSelect: (style: string) => void
  onWebsiteStyleSelect: (style: string) => void
  onConfirm: () => void
}

const emailStyles = [
  {
    id: "coffee-chat",
    name: "Coffee Chat",
    description: "Formal, business-appropriate tone with structured approach",
    preview: "Dear [Name], I hope this message finds you well. I recently came across your profile...",
  },
  {
    id: "job-interview",
    name: "Job Interview",
    description: "Job interview style with a focus on qualifications and fit",
    preview: "Hi [Name]! I am a recruiter at [Company] and I was impressed by your background in [Field]...",
  },
]

const websiteStyles = [
  {
    id: "job-interview-portal",
    name: "Job Interview Portal",
    description: "A Job interview portal with a clean, professional layout. Will prompt for google login",
    preview: "Sleek design with animated gradients, modern fonts, and interactive elements",
  },
  {
    id: "google-meet",
    name: "Google Meets",
    description: "Traditional Google Meets style login with a focus on video conferencing",
    preview: "Professional white background with serif typography and structured layout",
  },
]

export function StyleSelector({
  selectedEmailStyle,
  selectedWebsiteStyle,
  onEmailStyleSelect,
  onWebsiteStyleSelect,
  onConfirm,
}: StyleSelectorProps) {
  const canConfirm = selectedEmailStyle && selectedWebsiteStyle

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Choose Your Content Styles
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Select the style and tone for your generated email and website based on the research above.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Email Styles */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Style
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {emailStyles.map((style) => (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedEmailStyle === style.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => onEmailStyleSelect(style.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{style.name}</h4>
                        {selectedEmailStyle === style.id && <Check className="w-4 h-4 text-green-600" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{style.description}</p>
                    <div className="bg-gray-100 p-3 rounded text-xs italic">{style.preview}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Website Styles */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Website Style
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {websiteStyles.map((style) => (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedWebsiteStyle === style.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => onWebsiteStyleSelect(style.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{style.name}</h4>
                        {selectedWebsiteStyle === style.id && <Check className="w-4 h-4 text-green-600" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{style.description}</p>
                    <div className="bg-gray-100 p-3 rounded text-xs">{style.preview}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onConfirm} disabled={!canConfirm} className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Generate Content with Selected Styles
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

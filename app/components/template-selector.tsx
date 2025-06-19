"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Sparkles, Mail, Code } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  style: string
  preview: string
  type: "email" | "website"
}

interface TemplateSelectorProps {
  templates: Template[]
  selectedEmailTemplate: string | null
  selectedWebsiteTemplate: string | null
  onEmailTemplateSelect: (templateId: string) => void
  onWebsiteTemplateSelect: (templateId: string) => void
  onConfirm: () => void
}

export function TemplateSelector({
  templates,
  selectedEmailTemplate,
  selectedWebsiteTemplate,
  onEmailTemplateSelect,
  onWebsiteTemplateSelect,
  onConfirm,
}: TemplateSelectorProps) {
  const emailTemplates = Array.isArray(templates) ? templates.filter((t) => t.type === "email") : []
  const websiteTemplates = Array.isArray(templates) ? templates.filter((t) => t.type === "website") : []

  const canConfirm = selectedEmailTemplate && selectedWebsiteTemplate

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Choose AI-Generated Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Website Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid gap-4">
                {emailTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedEmailTemplate === template.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => onEmailTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge variant="outline">{template.style}</Badge>
                            {selectedEmailTemplate === template.id && <Check className="w-4 h-4 text-green-600" />}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="bg-gray-100 p-3 rounded text-xs font-mono">{template.preview}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="website" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid gap-4">
                {websiteTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedWebsiteTemplate === template.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => onWebsiteTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge variant="outline">{template.style}</Badge>
                            {selectedWebsiteTemplate === template.id && <Check className="w-4 h-4 text-green-600" />}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="bg-gray-100 p-3 rounded text-xs">{template.preview}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={onConfirm} disabled={!canConfirm} className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Continue with Selected Templates
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Mail, Users, Video, Code, Palette, Edit } from "lucide-react" // Added Edit icon
import { useState } from "react"
import { UrlInputModal } from "./url-input-modal"
import { Textarea } from "@/components/ui/textarea" // Added Textarea

interface EmailSubjectSelectorProps {
  selectedSubject: string
  selectedEmailStyle: string
  selectedWebsiteStyle: string
  onSubjectSelect: (subject: string) => void
  onEmailStyleSelect: (style: string) => void
  onWebsiteStyleSelect: (style: string) => void
  onConfirm: () => void
  customStyleData?: any
  customUrl?: string
  onCustomStyleUpdate?: (url: string, data: any) => void
  // New props for custom prompts
  customEmailPrompt: string
  onCustomEmailPromptChange: (prompt: string) => void
  customWebsitePrompt: string
  onCustomWebsitePromptChange: (prompt: string) => void
}

const emailSubjects = [
  {
    id: "collaboration",
    name: "Collaboration Proposal",
    icon: <Users className="w-4 h-4" />,
    description: "Propose a collaboration opportunity with a link to join the proposal.",
    preview: "Subject: Collaboration Opportunity - Let's Build Something Together",
  },
  {
    id: "meeting_request",
    name: "Meeting Request",
    icon: <Video className="w-4 h-4" />,
    description: "Ask about their work/qualities and invite them to a meeting.",
    preview: "Subject: Quick Chat About Your [Specific Work/Quality] - 15 Min Meeting?",
  },
  {
    id: "custom_prompt",
    name: "Custom Prompt",
    icon: <Edit className="w-4 h-4" />,
    description: "Write your own prompt for the email generation.",
    preview: "Your custom prompt will be used to generate the email.",
  },
]

const emailStyles = [
  {
    id: "formal",
    name: "Formal",
    description: "Professional and respectful tone.",
  },
  {
    id: "casual",
    name: "Casual",
    description: "Friendly and approachable tone.",
  },
  {
    id: "persuasive",
    name: "Persuasive",
    description: "Convincing and influential tone.",
  },
  {
    id: "informative",
    name: "Informative",
    description: "Clear and concise tone.",
  },
]

const websiteStyles = [
  {
    id: "google-login",
    name: "Google Login Style",
    description: "Clean, Material Design login page matching Google's style.",
    preview: "Google's signature blue (#4285f4), clean forms, and Material Design principles.",
  },
  {
    id: "google-meets",
    name: "Google Meet Login",
    description: "Google Meet style login page for meeting access.",
    preview: "Google Meet's interface with video call styling and meeting room access.",
  },
  {
    id: "zoom-login",
    name: "Zoom Login Style",
    description: "Zoom's login page design for meeting access.",
    preview: "Zoom's blue and white design with meeting room entry styling.",
  },
  {
    id: "custom-url",
    name: "Custom URL Style",
    description: "Clone the visual style from any website URL.",
    preview: "Analyze and replicate colors, fonts, and styling from a specific website.",
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Ultra-clean design with lots of whitespace and minimal elements.",
    preview: "Modern typography, subtle shadows, and clean presentation with blue accents.",
  },
  {
    id: "corporate",
    name: "Corporate Professional",
    description: "Business-focused design with professional styling.",
    preview: "Navy and gray color scheme, formal typography, and trustworthy appearance.",
  },
  {
    id: "custom_prompt",
    name: "Custom Prompt",
    icon: <Edit className="w-4 h-4" />,
    description: "Write your own prompt for the login page generation.",
    preview: "Your custom prompt will be used to generate the HTML.",
  },
]

export function EmailSubjectSelector({
  selectedSubject,
  selectedEmailStyle,
  selectedWebsiteStyle,
  onSubjectSelect,
  onEmailStyleSelect,
  onWebsiteStyleSelect,
  onConfirm,
  customStyleData,
  customUrl,
  onCustomStyleUpdate,
  customEmailPrompt,
  onCustomEmailPromptChange,
  customWebsitePrompt,
  onCustomWebsitePromptChange,
}: EmailSubjectSelectorProps) {
  const [showUrlModal, setShowUrlModal] = useState(false)

  const handleWebsiteStyleSelect = (style: string) => {
    if (style === "custom-url") {
      setShowUrlModal(true)
    } else {
      onWebsiteStyleSelect(style)
      // Clear custom style data if not custom-url
      if (onCustomStyleUpdate) {
        onCustomStyleUpdate("", null)
      }
    }
  }

  const handleUrlSubmit = (url: string, scrapedData: any) => {
    onWebsiteStyleSelect("custom-url")
    if (onCustomStyleUpdate) {
      onCustomStyleUpdate(url, scrapedData)
    }
  }

  const canConfirm =
    selectedSubject &&
    selectedEmailStyle &&
    selectedWebsiteStyle &&
    (selectedSubject !== "custom_prompt" || customEmailPrompt.trim() !== "") &&
    (selectedWebsiteStyle !== "custom_prompt" || customWebsitePrompt.trim() !== "")

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Configure Email & Login Page Generation
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select the purpose and style for your email, and choose the design style for the login page.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Email Subject/Purpose */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Purpose
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {emailSubjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSubject === subject.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => onSubjectSelect(subject.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {subject.icon}
                          <h4 className="font-semibold">{subject.name}</h4>
                          {selectedSubject === subject.id && <Check className="w-4 h-4 text-green-600" />}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{subject.description}</p>
                      <div className="bg-gray-100 p-3 rounded text-xs italic">{subject.preview}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedSubject === "custom_prompt" && (
                <div className="mt-4">
                  <label htmlFor="custom-email-prompt" className="block text-sm font-medium mb-2">
                    Your Custom Email Prompt:
                  </label>
                  <Textarea
                    id="custom-email-prompt"
                    value={customEmailPrompt}
                    onChange={(e) => onCustomEmailPromptChange(e.target.value)}
                    placeholder="e.g., Write a very short, direct email introducing a new product. Focus on benefits."
                    rows={5}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Email Style */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Email Tone & Style</h3>
              <div className="grid gap-4 md:grid-cols-4">
                {emailStyles.map((style) => (
                  <Card
                    key={style.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedEmailStyle === style.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => onEmailStyleSelect(style.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{style.name}</h4>
                        {selectedEmailStyle === style.id && <Check className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-gray-600">{style.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Website Style */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Login Page Style
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {websiteStyles.map((style) => (
                  <Card
                    key={style.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedWebsiteStyle === style.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => handleWebsiteStyleSelect(style.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {style.icon || <Code className="w-4 h-4" />}
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
              {selectedWebsiteStyle === "custom_prompt" && (
                <div className="mt-4">
                  <label htmlFor="custom-website-prompt" className="block text-sm font-medium mb-2">
                    Your Custom Login Page Prompt:
                  </label>
                  <Textarea
                    id="custom-website-prompt"
                    value={customWebsitePrompt}
                    onChange={(e) => onCustomWebsitePromptChange(e.target.value)}
                    placeholder="e.g., Create a dark-themed login page with a futuristic design and glowing buttons."
                    rows={5}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {selectedWebsiteStyle === "custom-url" && customUrl && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Custom Style Source:</p>
                <p className="text-sm text-blue-700 break-all">{customUrl}</p>
                <p className="text-xs text-blue-600 mt-1">{customStyleData}</p>
                <Button variant="outline" size="sm" onClick={() => setShowUrlModal(true)} className="mt-2">
                  Change URL
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onConfirm} disabled={!canConfirm} className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Generate Email & Login Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <UrlInputModal isOpen={showUrlModal} onClose={() => setShowUrlModal(false)} onUrlSubmit={handleUrlSubmit} />
    </>
  )
}

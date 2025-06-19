"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Search, Calendar, ExternalLink, Mail, Globe, ChevronRight, Trash2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ResearchSession {
  id: string
  query: string
  current_step: string
  search_results: any
  scraped_content: any
  generated_email: any
  generated_website: any
  email_subject: string
  email_style: string
  website_style: string
  selected_urls: string[]
  scrape_statuses: any[]
  created_at: string
  updated_at: string
}

interface ResearchHistoryProps {
  userId: string
  onRestoreSession: (session: ResearchSession) => void
  onNewResearch: () => void
}

export function ResearchHistory({ userId, onRestoreSession, onNewResearch }: ResearchHistoryProps) {
  const [sessions, setSessions] = useState<ResearchSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSessions()
  }, [userId])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/research/history?userId=${userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch research history")
      }

      setSessions(data.sessions || [])
    } catch (error) {
      console.error("Failed to fetch research history:", error)
      setError(error instanceof Error ? error.message : "Failed to load research history")
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/research/history/${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete session")
      }

      setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    } catch (error) {
      console.error("Failed to delete session:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStepBadge = (step: string) => {
    const stepConfig = {
      input: { label: "Started", color: "bg-gray-100 text-gray-800" },
      links: { label: "Link Selection", color: "bg-blue-100 text-blue-800" },
      scraping: { label: "Scraping", color: "bg-yellow-100 text-yellow-800" },
      "scraping-complete": { label: "Scraping Done", color: "bg-green-100 text-green-800" },
      "email-config": { label: "Configuration", color: "bg-purple-100 text-purple-800" },
      processing: { label: "AI Generation", color: "bg-orange-100 text-orange-800" },
      completed: { label: "Completed", color: "bg-green-100 text-green-800" },
    }

    const config = stepConfig[step as keyof typeof stepConfig] || stepConfig.input
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
  }

  const handleRestoreClick = (session: ResearchSession) => {
    console.log("Restoring session:", {
      id: session.id,
      query: session.query,
      currentStep: session.current_step,
    })
    onRestoreSession(session)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Research History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading research history...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Research History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Research History
          </div>
          <Button onClick={onNewResearch} size="sm">
            New Research
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No previous research sessions found.</p>
            <p className="text-sm">Start your first research to see it here!</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{session.query}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.created_at)}
                          {session.updated_at !== session.created_at && (
                            <span className="text-xs">(Updated {formatDate(session.updated_at)})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {getStepBadge(session.current_step)}
                          {session.email_subject && (
                            <Badge variant="outline" className="text-xs">
                              {session.email_subject}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span>{session.scraped_content?.scrapedData?.length || 0} sites scraped</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-green-600" />
                        <span>{session.generated_email ? "Email generated" : "No email yet"}</span>
                      </div>
                    </div>

                    {session.generated_website?.fullUrl && (
                      <div className="mb-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(session.generated_website.fullUrl, "_blank")
                          }}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Website
                        </Button>
                      </div>
                    )}

                    <Button
                      onClick={() => handleRestoreClick(session)}
                      className="w-full flex items-center justify-center gap-2"
                      size="sm"
                    >
                      Continue Research
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

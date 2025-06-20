"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Mail, Code, AlertCircle, LogOut, History } from "lucide-react"
import { WebsitePreview } from "./components/website-preview"
import { EmailSubjectSelector } from "./components/email-subject-selector"
import { LinkSelector } from "./components/link-selector"
import { ScrapingStatus } from "./components/scraping-status"
import { ScrapingComplete } from "./components/scraping-complete"
import { LoadingSpinner } from "./components/loading-spinner"
import { UsageLimitCard } from "@/components/usage-limit-card"
import { ResearchHistory } from "./components/research-history"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User } from "@supabase/supabase-js"
import { createClientBrowser } from "@/lib/supabase"

// deploy test
const supabase = createClientBrowser()

interface WorkflowStep {
  id: string
  name: string
  status: "pending" | "running" | "completed" | "error"
  result?: any
  error?: string
  icon: React.ReactNode
}

interface ScrapeStatus {
  url: string
  status: "pending" | "scraping" | "completed" | "error"
  title?: string
  wordCount?: number
  error?: string
}

interface UsageData {
  currentUsage: number
  maxUsage: number
  canResearch: boolean
}

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
  custom_email_prompt?: string // New field
  custom_website_prompt?: string // New field
}

// Simple Auth Component
function AuthSection() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage("Successfully signed in!")
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage("Check your email for the confirmation link!")
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Connecting to Google...
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AIResearchBot() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<
    "history" | "input" | "links" | "scraping" | "scraping-complete" | "email-config" | "processing"
  >("history")

  // Session management
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Usage tracking - Initialize with default values and don't block on loading
  const [usageData, setUsageData] = useState<UsageData>({ currentUsage: 0, maxUsage: 5, canResearch: true })
  const [usageError, setUsageError] = useState<string>("")

  // Email and website configuration state
  const [selectedEmailSubject, setSelectedEmailSubject] = useState<string>() // Default to new subject
  const [selectedEmailStyle, setSelectedEmailStyle] = useState<string>()
  const [selectedWebsiteStyle, setSelectedWebsiteStyle] = useState<string>() // Default to new style

  // Link selection state
  const [searchResults, setSearchResults] = useState<any>(null)
  const [selectedUrls, setSelectedUrls] = useState<string[]>([])
  const [scrapedContent, setScrapedContent] = useState<any>(null)
  const [generatedEmail, setGeneratedEmail] = useState<any>(null)

  // Scraping status
  const [scrapeStatuses, setScrapeStatuses] = useState<ScrapeStatus[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Custom style data for "custom-url" website style
  const [customStyleData, setCustomStyleData] = useState<any>(null)
  const [customUrl, setCustomUrl] = useState<string>("")

  // New state for custom prompts
  const [customEmailPrompt, setCustomEmailPrompt] = useState<string>("")
  const [customWebsitePrompt, setCustomWebsitePrompt] = useState<string>("")

  // Auth state management
  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (mounted) {
          console.log("Session result:", session ? "User found" : "No user")
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error("Session error:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session ? "User found" : "No user")
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Load user usage data - but don't block the UI
  useEffect(() => {
    if (user) {
      console.log("User found, fetching usage data...")
      fetchUsageData()
    } else {
      console.log("No user, skipping usage data fetch")
    }
  }, [user])

  const fetchUsageData = async () => {
    if (!user) return

    try {
      console.log("Fetching usage data for user:", user.id)
      const response = await fetch(`/api/user/usage?userId=${user.id}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Usage data received:", data)
      setUsageData(data)
      setUsageError("")
    } catch (error) {
      console.error("Failed to fetch usage data:", error)
      setUsageError(error instanceof Error ? error.message : "Failed to load usage data")
      // Set default values so the UI isn't blocked
      setUsageData({ currentUsage: 0, maxUsage: 5, canResearch: true })
    }
  }

  const saveCurrentState = async () => {
    if (!user || currentStep === "history") return

    try {
      const response = await fetch("/api/research/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          sessionId: currentSessionId,
          query,
          currentStep,
          searchResults,
          scrapedContent,
          generatedEmail,
          generatedWebsite: workflowSteps.find((step) => step.id === "website")?.result,
          emailSubject: selectedEmailSubject,
          emailStyle: selectedEmailStyle,
          websiteStyle: selectedWebsiteStyle,
          selectedUrls,
          scrapeStatuses,
          customEmailPrompt, // Save custom email prompt
          customWebsitePrompt, // Save custom website prompt
        }),
      })

      const data = await response.json()
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId)
      }
    } catch (error) {
      console.error("Failed to save current state:", error)
    }
  }

  // Replace the complex auto-save effects with this simpler version
  useEffect(() => {
    if (user && currentStep !== "history") {
      const timer = setTimeout(() => {
        saveCurrentState()
      }, 2000) // Save after 2 seconds of inactivity

      return () => clearTimeout(timer)
    }
  }, [currentStep, searchResults, scrapedContent, generatedEmail, customEmailPrompt, customWebsitePrompt]) // Added custom prompts to dependencies

  const incrementUsage = async () => {
    if (!user) return false

    try {
      const response = await fetch("/api/user/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, query }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      const data = await response.json()
      setUsageData((prev) => ({ ...prev, currentUsage: data.newUsage, canResearch: data.newUsage < 5 }))
      return true
    } catch (error) {
      console.error("Failed to increment usage:", error)
      return false
    }
  }

  const saveResearchSession = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/research/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          sessionId: currentSessionId,
          query,
          currentStep: "completed",
          searchResults,
          scrapedContent,
          generatedEmail,
          generatedWebsite: workflowSteps.find((step) => step.id === "website")?.result,
          emailSubject: selectedEmailSubject,
          emailStyle: selectedEmailStyle,
          websiteStyle: selectedWebsiteStyle,
          selectedUrls,
          scrapeStatuses,
          customEmailPrompt, // Save custom email prompt
          customWebsitePrompt, // Save custom website prompt
        }),
      })

      const data = await response.json()
      if (data.sessionId) {
        setCurrentSessionId(data.sessionId)
      }
    } catch (error) {
      console.error("Failed to save research session:", error)
    }
  }

  const restoreSession = (session: ResearchSession) => {
    setCurrentSessionId(session.id)
    setQuery(session.query)
    setCurrentStep(session.current_step as any)
    setSearchResults(session.search_results)
    setScrapedContent(session.scraped_content)
    setGeneratedEmail(session.generated_email)
    setSelectedEmailSubject(session.email_subject || "collaboration") // Default to new subject
    setSelectedEmailStyle(session.email_style || "professional")
    setSelectedWebsiteStyle(session.website_style || "google-login") // Default to new style
    setSelectedUrls(session.selected_urls || [])
    setScrapeStatuses(session.scrape_statuses || [])
    setCustomEmailPrompt(session.custom_email_prompt || "") // Restore custom email prompt
    setCustomWebsitePrompt(session.custom_website_prompt || "") // Restore custom website prompt

    // Restore workflow steps if they exist
    if (session.generated_website || session.generated_email) {
      const steps: WorkflowStep[] = []

      if (session.generated_website) {
        steps.push({
          id: "website",
          name: "AI generating website",
          status: "completed",
          result: session.generated_website,
          icon: <Code className="w-4 h-4" />,
        })
      }

      if (session.generated_email) {
        steps.push({
          id: "email",
          name: "AI generating email",
          status: "completed",
          result: session.generated_email,
          icon: <Mail className="w-4 h-4" />,
        })
      }

      setWorkflowSteps(steps)
    }
  }

  const startNewResearch = () => {
    setCurrentSessionId(null)
    setCurrentStep("input")
    setWorkflowSteps([])
    setIsWorkflowRunning(false)
    setSelectedEmailSubject("collaboration") // Reset to new default
    setSelectedEmailStyle("professional")
    setSelectedWebsiteStyle("google-login") // Reset to new default
    setSearchResults(null)
    setSelectedUrls([])
    setScrapedContent(null)
    setScrapeStatuses([])
    setIsSearching(false)
    setGeneratedEmail(null)
    setQuery("")
    setCustomEmailPrompt("") // Clear custom email prompt
    setCustomWebsitePrompt("") // Clear custom website prompt
  }

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isWorkflowRunning || !usageData.canResearch) return

    // Check if we already have a session for this query
    if (currentSessionId) {
      console.log("Continuing existing session:", currentSessionId)
    } else {
      // Increment usage only for new queries
      const usageIncremented = await incrementUsage()
      if (!usageIncremented) {
        alert("Failed to start research. Please try again.")
        return
      }
    }

    setIsWorkflowRunning(true)
    setIsSearching(true)
    // Don't set currentStep to "links" yet - keep it at "input" to show loading

    try {
      // Get search results first
      const searchResponse = await fetch("/api/workflow/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }),
      })

      const searchData = await searchResponse.json()
      setSearchResults(searchData)
      setSelectedUrls(searchData.urls || [])

      // Only now set the step to "links" after search is complete
      setCurrentStep("links")
    } catch (error) {
      console.error("Initial setup error:", error)
      setIsWorkflowRunning(false)
      setCurrentStep("input")
    } finally {
      setIsSearching(false)
    }
  }

  const handleUrlToggle = (url: string) => {
    const newUrls = selectedUrls.includes(url) ? selectedUrls.filter((u) => u !== url) : [...selectedUrls, url]
    setSelectedUrls(newUrls)
  }

  const handleLinksConfirm = async () => {
    setCurrentStep("scraping")

    // Initialize scrape statuses
    const initialStatuses: ScrapeStatus[] = selectedUrls.map((url) => ({
      url,
      status: "pending",
    }))
    setScrapeStatuses(initialStatuses)

    try {
      // Start streaming scrape
      const response = await fetch("/api/workflow/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: selectedUrls }),
      })

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === "status") {
                setScrapeStatuses((prev) =>
                  prev.map((status, index) =>
                    index === data.index
                      ? {
                          ...status,
                          status: data.status,
                          title: data.title,
                          wordCount: data.wordCount,
                          error: data.error,
                        }
                      : status,
                  ),
                )
              } else if (data.type === "complete") {
                setScrapedContent(data.data)
                setCurrentStep("scraping-complete")
                setIsWorkflowRunning(false)
              } else if (data.type === "error") {
                console.error("Scraping error:", data.error)
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error("Scraping error:", error)
      setIsWorkflowRunning(false)
      setCurrentStep("input")
    }
  }

  const handleScrapingContinue = () => {
    setCurrentStep("email-config")
  }

  const handleEmailConfigConfirm = async () => {
    setCurrentStep("processing")
    setIsWorkflowRunning(true)

    // Initialize workflow steps
    const steps: WorkflowStep[] = [
      { id: "website", name: "AI generating website", status: "pending", icon: <Code className="w-4 h-4" /> },
      { id: "email", name: "AI generating email", status: "pending", icon: <Mail className="w-4 h-4" /> },
    ]
    setWorkflowSteps(steps)

    try {
      // Step 1: Generate website with AI
      setWorkflowSteps((prev) => prev.map((step) => (step.id === "website" ? { ...step, status: "running" } : step)))

      const websiteResponse = await fetch("/api/workflow/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          searchResults: searchResults,
          scrapedContent: scrapedContent,
          templateStyle: selectedWebsiteStyle,
          customStyleData: customStyleData,
          customUrl: customUrl,
          customWebsitePrompt: customWebsitePrompt, // Pass custom website prompt
        }),
      })

      const websiteData = await websiteResponse.json()

      if (!websiteResponse.ok) {
        throw new Error(websiteData.error || "Website generation failed")
      }

      setWorkflowSteps((prev) =>
        prev.map((step) => (step.id === "website" ? { ...step, status: "completed", result: websiteData } : step)),
      )

      // Step 2: Generate email with AI
      setWorkflowSteps((prev) => prev.map((step) => (step.id === "email" ? { ...step, status: "running" } : step)))

      const emailResponse = await fetch("/api/workflow/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          searchResults: searchResults,
          scrapedContent: scrapedContent,
          websiteUrl: websiteData.fullUrl,
          emailSubject: selectedEmailSubject,
          emailStyle: selectedEmailStyle,
          customEmailPrompt: customEmailPrompt, // Pass custom email prompt
        }),
      })

      const emailData = await emailResponse.json()

      if (!emailResponse.ok) {
        throw new Error(emailData.error || "Email generation failed")
      }

      setWorkflowSteps((prev) =>
        prev.map((step) => (step.id === "email" ? { ...step, status: "completed", result: emailData } : step)),
      )

      setGeneratedEmail(emailData)

      // Save the research session
      await saveResearchSession()
    } catch (error) {
      console.error("Generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Generation failed"
      setWorkflowSteps((prev) =>
        prev.map((step) => (step.status === "running" ? { ...step, status: "error", error: errorMessage } : step)),
      )
    } finally {
      setIsWorkflowRunning(false)
    }
  }

  const resetWorkflow = () => {
    setCurrentStep("history")
    setWorkflowSteps([])
    setIsWorkflowRunning(false)
    setSelectedEmailSubject("collaboration") // Reset to new default
    setSelectedEmailStyle("professional")
    setSelectedWebsiteStyle("google-login") // Reset to new default
    setSearchResults(null)
    setSelectedUrls([])
    setScrapedContent(null)
    setScrapeStatuses([])
    setIsSearching(false)
    setGeneratedEmail(null)
    setQuery("")
    setCurrentSessionId(null)
    setCustomEmailPrompt("") // Clear custom email prompt
    setCustomWebsitePrompt("") // Clear custom website prompt
  }

  const handleBackToSearch = () => {
    setCurrentStep("input")
    setIsWorkflowRunning(false)
    setIsSearching(false)
    // Keep the query and other data intact
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Only show loading for auth, not for usage data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (!user) {
    return <AuthSection />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with user info and sign out */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                PhindShyt
              </CardTitle>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentStep("history")}>
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Usage Limit Card - show error if usage data failed to load */}
        {usageError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load usage data: {usageError}. You can still use the app with default limits.
            </AlertDescription>
          </Alert>
        ) : (
          <UsageLimitCard currentUsage={usageData.currentUsage} maxUsage={usageData.maxUsage} />
        )}

        {currentStep === "history" && (
          <ResearchHistory userId={user.id} onRestoreSession={restoreSession} onNewResearch={startNewResearch} />
        )}

        {currentStep === "input" && (
          <Card>
            <CardHeader>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This bot uses OpenAI GPT-4 and is on a free plan, so it has a limit of 5 research queries per month.
                </AlertDescription>
              </Alert>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Searching for information about "{query}"...</p>
                  <p className="mt-2 text-sm text-gray-500">Finding relevant websites and sources</p>
                </div>
              ) : (
                <>
                  <form onSubmit={handleInitialSubmit} className="flex gap-2">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter a research query (e.g., 'jeffrey lin waterloo syde')"
                      disabled={isWorkflowRunning || isSearching || !usageData.canResearch}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isWorkflowRunning || isSearching || !query.trim() || !usageData.canResearch}
                      className="flex items-center gap-2"
                    >
                      {isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
                      {isSearching ? "Searching..." : "Search & Scrape"}
                    </Button>
                  </form>
                  {!usageData.canResearch && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You've reached your research limit of {usageData.maxUsage} searches. Contact support to increase
                        your quota.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === "links" && searchResults && Array.isArray(searchResults.results) && (
          <>
            <LinkSelector
              searchResults={searchResults.results}
              selectedUrls={selectedUrls}
              onUrlToggle={handleUrlToggle}
              onConfirm={handleLinksConfirm}
            />
            <div className="flex justify-start">
              <Button variant="outline" onClick={handleBackToSearch}>
                ← Back to Search
              </Button>
            </div>
          </>
        )}

        {currentStep === "scraping" && (
          <>
            <ScrapingStatus scrapeStatuses={scrapeStatuses} isActive={true} />
          </>
        )}

        {currentStep === "scraping-complete" && scrapedContent && (
          <ScrapingComplete
            scrapedContent={scrapedContent}
            onContinue={handleScrapingContinue}
            onBack={() => setCurrentStep("links")}
          />
        )}

        {currentStep === "email-config" && (
          <>
            {/* User Summary Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Search className="w-5 h-5" />
                  Research Summary for "{query}"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Content Discovered</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Websites scraped:</span>
                        <span className="font-medium">{scrapedContent?.scrapedData?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total words extracted:</span>
                        <span className="font-medium">
                          {scrapedContent?.scrapedData
                            ?.reduce((sum: number, data: any) => sum + (data.metadata?.wordCount || 0), 0)
                            .toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sources found:</span>
                        <span className="font-medium">{searchResults?.results?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Key Information</h4>
                    <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                      {scrapedContent?.scrapedData?.[0]?.content?.substring(0, 200) || "No content available"}
                      {scrapedContent?.scrapedData?.[0]?.content?.length > 200 && "..."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <EmailSubjectSelector
              selectedSubject={selectedEmailSubject}
              selectedEmailStyle={selectedEmailStyle}
              selectedWebsiteStyle={selectedWebsiteStyle}
              onSubjectSelect={setSelectedEmailSubject}
              onEmailStyleSelect={setSelectedEmailStyle}
              onWebsiteStyleSelect={setSelectedWebsiteStyle}
              onConfirm={handleEmailConfigConfirm}
              customStyleData={customStyleData}
              customUrl={customUrl}
              onCustomStyleUpdate={(url, data) => {
                setCustomUrl(url)
                setCustomStyleData(data)
              }}
              customEmailPrompt={customEmailPrompt}
              onCustomEmailPromptChange={setCustomEmailPrompt}
              customWebsitePrompt={customWebsitePrompt}
              onCustomWebsitePromptChange={setCustomWebsitePrompt}
            />
            <div className="flex justify-start">
              <Button variant="outline" onClick={() => setCurrentStep("scraping-complete")}>
                ← Back to Scraping Results
              </Button>
            </div>
          </>
        )}

        {currentStep === "processing" && Array.isArray(workflowSteps) && workflowSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>AI Content Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflowSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        step.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : step.status === "running"
                            ? "bg-blue-100 text-blue-600"
                            : step.status === "error"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.status === "running" ? <LoadingSpinner size="sm" /> : step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.name}</div>
                      <div
                        className={`text-sm ${
                          step.status === "completed"
                            ? "text-green-600"
                            : step.status === "running"
                              ? "text-blue-600"
                              : step.status === "error"
                                ? "text-red-600"
                                : "text-gray-500"
                        }`}
                      >
                        {step.status === "completed"
                          ? "Completed"
                          : step.status === "running"
                            ? "Generating with OpenAI GPT-4..."
                            : step.status === "error"
                              ? `Error: ${step.error || "Generation failed"}`
                              : "Waiting..."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {Array.isArray(workflowSteps) &&
          workflowSteps.find((step) => step.id === "website" && step.status === "completed") && (
            <WebsitePreview
              url={workflowSteps.find((step) => step.id === "website")?.result?.url || ""}
              fullUrl={workflowSteps.find((step) => step.id === "website")?.result?.fullUrl || ""}
            />
          )}

        {generatedEmail && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI-Generated Email</span>
                <Button variant="outline" size="sm" onClick={resetWorkflow}>
                  Back to History
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 border-l-4 border-green-400 p-4 rounded-lg">
                  <div className="font-medium mb-2">Generated Email:</div>
                  <div className="whitespace-pre-wrap font-mono text-sm">{generatedEmail.email}</div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Template: {generatedEmail.template}</span>
                  <span>Style: {generatedEmail.style}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

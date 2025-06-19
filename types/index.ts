import type React from "react"
// Core API Response Types
export interface SearchResult {
  title: string
  url: string
  snippet: string
  error?: string
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  urls: string[]
  error?: string
}

// Scraping Types
export interface ScrapedMetadata {
  scrapedAt: string
  wordCount: number
  domain: string
  error?: boolean
}

export interface ScrapedData {
  url: string
  title: string
  content: string
  metadata: ScrapedMetadata
  error?: string
}

export interface ScrapedContent {
  scrapedData: ScrapedData[]
  error?: string
}

export interface ScrapeStatus {
  url: string
  status: "pending" | "scraping" | "completed" | "error"
  title?: string
  wordCount?: number
  error?: string
}

// Style Analysis Types
export interface StyleColors {
  primary: string
  secondary: string
  background: string
  text: string
  border: string
  error?: string
}

export interface StyleFonts {
  primary: string
  secondary: string
  error?: string
}

export interface ButtonStyles {
  borderRadius: string
  padding: string
  fontWeight: string
  error?: string
}

export interface FormStyles {
  borderRadius: string
  border: string
  padding: string
  error?: string
}

export interface StyleAnalysis {
  url: string
  title: string
  colors: StyleColors
  fonts: StyleFonts
  layout: string
  buttonStyles: ButtonStyles
  formStyles: FormStyles
  scrapedAt: string
  error?: string
}

// Email Generation Types
export interface EmailTemplate {
  name: string
  systemPrompt: string
  userPrompt: string
  error?: string
}

export interface GeneratedEmail {
  email: string
  template: string
  subject: string
  style: string
  error?: string
}

// Website Generation Types
export interface GeneratedWebsite {
  success: boolean
  url: string
  fullUrl: string
  websiteId: string
  filename: string
  template: string
  style: string
  customUrl?: string
  type: string
  error?: string
}

// Workflow Types
export interface WorkflowStep {
  id: string
  name: string
  status: "pending" | "running" | "completed" | "error"
  result?: GeneratedEmail | GeneratedWebsite | any
  error?: string
  icon: React.ReactNode
}

// Database Types
export interface UserResearch {
  id: string
  user_id: string
  query: string
  research_count: number
  created_at: string
  updated_at: string
  error?: string
}

export interface ResearchSession {
  id: string
  user_id: string
  query: string
  current_step: string
  search_results: SearchResponse | null
  scraped_content: ScrapedContent | null
  generated_email: GeneratedEmail | null
  generated_website: GeneratedWebsite | null
  email_subject: string
  email_style: string
  website_style: string
  selected_urls: string[]
  scrape_statuses: ScrapeStatus[]
  created_at: string
  updated_at: string
  custom_email_prompt?: string
  custom_website_prompt?: string
  error?: string
}

// Usage Tracking Types
export interface UsageData {
  currentUsage: number
  maxUsage: number
  canResearch: boolean
  error?: string
}

// Component Props Types
export interface LinkSelectorProps {
  searchResults: SearchResult[]
  selectedUrls: string[]
  onUrlToggle: (url: string) => void
  onConfirm: () => void
  error?: string
}

export interface ScrapingStatusProps {
  scrapeStatuses: ScrapeStatus[]
  isActive: boolean
  error?: string
}

export interface ScrapingCompleteProps {
  scrapedContent: ScrapedContent
  onContinue: () => void
  onBack: () => void
  error?: string
}

export interface EmailSubjectSelectorProps {
  selectedSubject: string
  selectedEmailStyle: string
  selectedWebsiteStyle: string
  onSubjectSelect: (subject: string) => void
  onEmailStyleSelect: (style: string) => void
  onWebsiteStyleSelect: (style: string) => void
  onConfirm: () => void
  customStyleData?: StyleAnalysis | null
  customUrl?: string
  onCustomStyleUpdate?: (url: string, data: StyleAnalysis | null) => void
  customEmailPrompt: string
  onCustomEmailPromptChange: (prompt: string) => void
  customWebsitePrompt: string
  onCustomWebsitePromptChange: (prompt: string) => void
  error?: string
}

export interface WebsitePreviewProps {
  url: string
  fullUrl: string
  error?: string
}

export interface UrlInputModalProps {
  isOpen: boolean
  onClose: () => void
  onUrlSubmit: (url: string, scrapedData: StyleAnalysis) => void
  error?: string
}

export interface ResearchHistoryProps {
  userId: string
  onRestoreSession: (session: ResearchSession) => void
  onNewResearch: () => void
  error?: string
}

export interface UsageLimitCardProps {
  currentUsage: number
  maxUsage: number
  error?: string
}

// API Request/Response Types
export interface SearchRequest {
  query: string
  error?: string
}

export interface ScrapeRequest {
  urls: string[]
  error?: string
}

export interface EmailGenerationRequest {
  query: string
  searchResults: SearchResponse
  scrapedContent: ScrapedContent
  websiteUrl: string
  emailSubject?: string
  emailStyle?: string
  customEmailPrompt?: string
  error?: string
}

export interface WebsiteGenerationRequest {
  query: string
  searchResults: SearchResponse
  scrapedContent: ScrapedContent
  templateStyle?: string
  customStyleData?: StyleAnalysis | null
  customUrl?: string
  customWebsitePrompt?: string
  error?: string
}

export interface ValidationRequest {
  url: string
  error?: string
}

export interface ValidationResponse {
  accessible: boolean
  title: string
  url: string
  error?: string
}

// Streaming Response Types
export interface StreamingMessage {
  type: "status" | "complete" | "error"
  index?: number
  status?: string
  url?: string
  title?: string
  wordCount?: number
  error?: string
  data?: any
}

// Email Subject and Style Configuration Types
export interface EmailSubject {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  preview: string
  error?: string
}

export interface EmailStyle {
  id: string
  name: string
  description: string
  error?: string
}

export interface WebsiteStyle {
  id: string
  name: string
  description: string
  preview: string
  icon?: React.ReactNode
  error?: string
}

// Step Types for Workflow
export type WorkflowStepType =
  | "history"
  | "input"
  | "links"
  | "scraping"
  | "scraping-complete"
  | "email-config"
  | "processing"

// Auth Types
export interface AuthUser {
  id: string
  email?: string
  user_metadata?: Record<string, any>
  app_metadata?: Record<string, any>
  error?: string
}

// Loading and Error States
export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface ProgressBarProps {
  current: number
  total: number
  label?: string
  className?: string
  error?: string
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
  error?: string
}

export interface StepTransitionProps {
  title: string
  description: string
  icon?: React.ReactNode
  error?: string
}

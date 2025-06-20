import { supabaseServer } from "./supabase-server"
import { userSummaryGenerator } from "./user-summary-generator"
import { advancedScraper } from "./advanced-scraper"

interface ScrapeJob {
  id: string
  user_id: string
  session_id: string
  urls: string[]
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  total_urls: number
  results: any[]
  error_message?: string
}

interface ScrapedResult {
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

class BackgroundScraper {
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start processing jobs every 10 seconds
    this.startProcessing()
  }

  startProcessing() {
    if (this.processingInterval) return

    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processNextJob()
      }
    }, 10000) // Check for new jobs every 10 seconds
  }

  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }

  async processNextJob(): Promise<void> {
    if (this.isProcessing) return

    try {
      this.isProcessing = true

      // Get the next pending job with session info
      const { data: job, error } = await supabaseServer
        .from("scraping_jobs")
        .select(`
          *,
          research_sessions!inner(query)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(1)
        .single()

      if (error || !job) {
        return // No pending jobs
      }

      console.log(`Processing scraping job ${job.id} with ${job.urls.length} URLs`)

      // Mark job as running
      await supabaseServer
        .from("scraping_jobs")
        .update({
          status: "running",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)

      // Process all URLs using the advanced scraper
      const results = await this.scrapeUrls(job.urls, job.id)

      // Mark job as completed and save results
      await supabaseServer
        .from("scraping_jobs")
        .update({
          status: "completed",
          progress: job.total_urls,
          results: results,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)

      // Update the research session with scraped content and generate summary
      const query = job.research_sessions?.query || "Unknown"
      await this.updateResearchSession(job.session_id, results, query)

      console.log(`Completed scraping job ${job.id}`)
    } catch (error) {
      console.error("Error processing scraping job:", error)

      // Mark job as failed if we have the job ID
      if (error.jobId) {
        await supabaseServer
          .from("scraping_jobs")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
            updated_at: new Date().toISOString(),
          })
          .eq("id", error.jobId)
      }
    } finally {
      this.isProcessing = false
    }
  }

  async scrapeUrls(urls: string[], jobId: string): Promise<ScrapedResult[]> {
    const results: ScrapedResult[] = []

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]

      try {
        console.log(`Scraping URL ${i + 1}/${urls.length}: ${url}`)

        // Use the advanced scraper
        const scrapedData = await advancedScraper.scrapeUrl(url)
        results.push(scrapedData)

        console.log(`Successfully scraped: ${url} (${scrapedData.metadata.wordCount} words)`)

        // Update progress in database
        await supabaseServer
          .from("scraping_jobs")
          .update({
            progress: i + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId)

        // Add delay between requests to be respectful to APIs
        if (i < urls.length - 1) {
          const delay = url.includes("linkedin.com") ? 10000 : 3000 // Longer delay for LinkedIn
          console.log(`Waiting ${delay / 1000}s before next request...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error)

        // Add error result but continue with other URLs
        results.push({
          url,
          title: "Error loading page",
          content: `Unable to scrape content from this URL: ${error instanceof Error ? error.message : "Unknown error"}`,
          metadata: {
            scrapedAt: new Date().toISOString(),
            wordCount: 0,
            domain: new URL(url).hostname,
            error: true,
          },
        })

        // Update progress even for failed URLs
        await supabaseServer
          .from("scraping_jobs")
          .update({
            progress: i + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId)
      }
    }

    return results
  }

  async updateResearchSession(sessionId: string, results: ScrapedResult[], query: string): Promise<void> {
    const scrapedContent = {
      scrapedData: results,
    }

    // Generate user summary
    console.log(`Generating user summary for session ${sessionId}`)
    const userSummary = await userSummaryGenerator.generateSummary(query, results)

    await supabaseServer
      .from("research_sessions")
      .update({
        scraped_content: scrapedContent,
        user_summary: userSummary, // Add user summary to session
        current_step: "summary-review", // New step for summary review
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)

    console.log(`User summary generated and saved for session ${sessionId}`)
  }
}

// Create singleton instance
export const backgroundScraper = new BackgroundScraper()

// Ensure cleanup on process exit
process.on("SIGINT", () => {
  backgroundScraper.stopProcessing()
  process.exit(0)
})

process.on("SIGTERM", () => {
  backgroundScraper.stopProcessing()
  process.exit(0)
})

import { supabaseServer } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const {
      userId,
      sessionId,
      query,
      currentStep,
      searchResults,
      scrapedContent,
      generatedEmail,
      generatedWebsite,
      emailSubject,
      emailStyle,
      websiteStyle,
      selectedUrls,
      scrapeStatuses,
    } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const sessionData = {
      user_id: userId,
      query: query || "",
      current_step: currentStep || "input",
      search_results: searchResults,
      scraped_content: scrapedContent,
      generated_email: generatedEmail,
      generated_website: generatedWebsite,
      email_subject: emailSubject || "",
      email_style: emailStyle || "",
      website_style: websiteStyle || "",
      selected_urls: selectedUrls || [],
      scrape_statuses: scrapeStatuses || [],
      updated_at: new Date().toISOString(),
    }

    console.log("Saving session data:", {
      userId,
      sessionId,
      currentStep,
      query: query?.substring(0, 50),
    })

    let data, error

    if (sessionId) {
      // Update existing session
      const result = await supabaseServer
        .from("research_sessions")
        .update(sessionData)
        .eq("id", sessionId)
        .eq("user_id", userId)
        .select()
        .single()

      data = result.data
      error = result.error
    } else {
      // Check if there's already a session with the same query for this user
      const { data: existingSession, error: findError } = await supabaseServer
        .from("research_sessions")
        .select("id")
        .eq("user_id", userId)
        .eq("query", query || "")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (findError && findError.code !== "PGRST116") {
        console.error("Error finding existing session:", findError)
        throw findError
      }

      if (existingSession) {
        // Update the existing session instead of creating a new one
        console.log("Found existing session for query, updating:", existingSession.id)
        const result = await supabaseServer
          .from("research_sessions")
          .update(sessionData)
          .eq("id", existingSession.id)
          .eq("user_id", userId)
          .select()
          .single()

        data = result.data
        error = result.error
      } else {
        // Create new session only if no existing session found
        console.log("No existing session found, creating new one")
        const result = await supabaseServer
          .from("research_sessions")
          .insert({
            ...sessionData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        data = result.data
        error = result.error
      }
    }

    if (error) {
      console.error("Database save error:", error)
      throw error
    }

    console.log("Session saved successfully:", {
      sessionId: data.id,
      currentStep: data.current_step,
      isUpdate: !!sessionId || !!data.updated_at,
    })

    return NextResponse.json({ success: true, sessionId: data.id, session: data })
  } catch (error) {
    console.error("Save research error:", error)
    return NextResponse.json({ error: "Failed to save research session" }, { status: 500 })
  }
}

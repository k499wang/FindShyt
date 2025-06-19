import { supabaseServer } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get or create user research record
    let { data: userResearch, error } = await supabaseServer
      .from("user_research")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error && error.code === "PGRST116") {
      // User doesn't exist, create new record
      const { data: newUserResearch, error: insertError } = await supabaseServer
        .from("user_research")
        .insert({
          user_id: userId,
          query: "",
          research_count: 0,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      userResearch = newUserResearch
    } else if (error) {
      throw error
    }

    return NextResponse.json({
      currentUsage: userResearch.research_count,
      maxUsage: 5,
      canResearch: userResearch.research_count < 5,
    })
  } catch (error) {
    console.error("Usage check error:", error)
    return NextResponse.json({ error: "Failed to check usage" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, query } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Check current usage
    const { data: userResearch, error: fetchError } = await supabaseServer
      .from("user_research")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    }

    if (userResearch.research_count >= 5) {
      return NextResponse.json({ error: "Research limit exceeded" }, { status: 403 })
    }

    // Increment usage
    const { error: updateError } = await supabaseServer
      .from("user_research")
      .update({
        research_count: userResearch.research_count + 1,
        query: query,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      newUsage: userResearch.research_count + 1,
    })
  } catch (error) {
    console.error("Usage increment error:", error)
    return NextResponse.json({ error: "Failed to increment usage" }, { status: 500 })
  }
}
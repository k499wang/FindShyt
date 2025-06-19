import { supabaseServer } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: sessions, error } = await supabaseServer
      .from("research_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    return NextResponse.json({ sessions: sessions || [] })
  } catch (error) {
    console.error("Fetch research history error:", error)
    return NextResponse.json({ error: "Failed to fetch research history" }, { status: 500 })
  }
}

import { supabaseServer } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const { error } = await supabaseServer.from("research_sessions").delete().eq("id", sessionId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete research session error:", error)
    return NextResponse.json({ error: "Failed to delete research session" }, { status: 500 })
  }
}

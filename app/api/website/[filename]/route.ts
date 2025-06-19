import { readFile } from "fs/promises"
import { join } from "path"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename

    // Security check - only allow .html files and prevent directory traversal
    if (!filename.endsWith(".html") || filename.includes("..") || filename.includes("/")) {
      return new Response("Invalid filename", { status: 400 })
    }

    const filePath = join(process.cwd(), "public", "generated", filename)
    const content = await readFile(filePath, "utf-8")

    return new Response(content, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("Error serving website:", error)
    return new Response("Website not found", { status: 404 })
  }
}

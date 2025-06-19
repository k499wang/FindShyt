export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 })
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      return Response.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Try to fetch the URL to check if it's accessible
    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LoginStyleBot/1.0)",
        },
        timeout: 10000,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Try to get the title by fetching the full page
      const fullResponse = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LoginStyleBot/1.0)",
        },
        timeout: 10000,
      })

      const html = await fullResponse.text()
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname

      return Response.json({
        accessible: true,
        title: title,
        url: url,
      })
    } catch (error) {
      return Response.json(
        {
          error: `Unable to access URL: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("URL validation error:", error)
    return Response.json({ error: "URL validation failed" }, { status: 500 })
  }
}

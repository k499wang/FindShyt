const serpApiKey = process.env.SERP_API_KEY

if (!serpApiKey) {
  console.warn("SERP_API_KEY not found, using mock data")
}

interface SerpResults {
  link: string,
  title?: string,
  description?: string,
  rank?: number,
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!serpApiKey) {
      return Response.json({ error: "SERP_API_KEY not configured" }, { status: 500 })
    }

    try {
      // BrightData SERP API call
      const response = await fetch(`https://api.brightdata.com/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serpApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "zone": "serp_api",
          "url": `https://www.google.com/search?q=${encodeURIComponent(query)}&brd_json=1`,
          "format": 'json'
        }),
        })

      if (!response.ok) {
        console.error("SERP API response error:", response.statusText)
        throw new Error(`SERP API error: ${response.status}`)
      }
      const data = await response.json();
      const parsed = JSON.parse(data.body);

      const organicData = parsed.organic || [];
      console.log("Organic results:", organicData)

      const results: SerpResults[] = organicData.map((item: any, index: number) => ({
        link: item.link,
        title: item.title || `Result ${index + 1}`,
        description: item.description || "No description available",
        rank: item.rank,
      }))

      const urls = results.map(result => result.link)

      return Response.json({
        query,
        results,
        urls,
      })

    } catch (apiError) {
      console.error("SERP API error:", apiError)
      return Response.json({ error: "Search API failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Search error:", error)
    return Response.json({ error: "Search failed" }, { status: 500 })
  }
}

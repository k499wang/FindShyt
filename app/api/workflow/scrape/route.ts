import { scrapeLink } from "@/app/modules/scrapeLink"

export async function POST(req: Request) {
  try {
    const { urls } = await req.json()

    // Return a streaming response for real-time updates
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {

          urls.forEach((url: string, index: number) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "status",
                  index: index,
                  status: "scraping",
                  url: url,
                })}\n\n`,
              ),
            )
          })

          // Scrape all URLs in parallel using BrightData
          const scrapePromises = urls.map(async (url: string, index: number) => {
            try {
              const data = await scrapeLink(url)

              // Process the scraped content
              const title = data?.title || "No title extracted"
              const content = data?.content || "No content extracted"

              const result = {
                url,
                title,
                content: content || "No content extracted",
                metadata: {
                  scrapedAt: new Date().toISOString(),
                  wordCount: content.split(" ").length,
                  domain: new URL(url).hostname,
                },
              }

              // Send individual completion status
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "status",
                    index: index,
                    status: "completed",
                    url: url,
                    title: result.title,
                    wordCount: result.metadata.wordCount,
                  })}\n\n`,
                ),
              )

              return result
            } catch (error) {
              const errorResult = {
                url,
                title: "Error loading page",
                content: "Unable to scrape content from this URL",
                metadata: {
                  scrapedAt: new Date().toISOString(),
                  wordCount: 0,
                  domain: new URL(url).hostname,
                  error: true,
                },
              }

              // Send error status
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "status",
                    index: index,
                    status: "error",
                    url: url,
                    error: error instanceof Error ? error.message : "Scraping failed",
                  })}\n\n`,
                ),
              )

              console.log("Error scraping URL:", url, error)


              return errorResult
            }
          })

          // Wait for all scraping to complete
          const results = await Promise.all(scrapePromises)

          // Send final result
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                data: { scrapedData: results }, // scrapedData is the name of this 
              })}\n\n`,
            ),
          )

          controller.close()
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`,
            ),
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("Scraping error:", error)
    return Response.json({ error: "Scraping failed" }, { status: 500 })
  }
}

// Fallback function for when BrightData API key is not available
async function handleMockParallelScraping(urls: string[]) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status for all URLs
        urls.forEach((url: string, index: number) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                index: index,
                status: "scraping",
                url: url,
              })}\n\n`,
            ),
          )
        })

        // Simulate parallel scraping with random delays
        const scrapePromises = urls.map(async (url: string, index: number) => {
          try {
            // Random delay to simulate real scraping (all happening in parallel)
            await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

            const mockContent = await getMockScrapedContent(url, index)

            // Send completion status
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "status",
                  index: index,
                  status: "completed",
                  url: url,
                  title: mockContent.title,
                  wordCount: mockContent.metadata.wordCount,
                })}\n\n`,
              ),
            )

            return mockContent
          } catch (error) {
            const errorResult = {
              url,
              title: "Error loading page",
              content: "Unable to scrape content from this URL",
              metadata: {
                scrapedAt: new Date().toISOString(),
                wordCount: 0,
                domain: new URL(url).hostname,
                error: true,
              },
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "status",
                  index: index,
                  status: "error",
                  url: url,
                  error: error instanceof Error ? error.message : "Unknown error",
                })}\n\n`,
              ),
            )

            return errorResult
          }
        })

        // Wait for all parallel scraping to complete
        const results = await Promise.all(scrapePromises)

        // Send final result
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              data: { scrapedData: results },
            })}\n\n`,
          ),
        )

        controller.close()
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`,
          ),
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  })
}

async function getMockScrapedContent(url: string, index: number) {
  const urlParts = url.split("/")
  const identifier = urlParts[urlParts.length - 1] || "person"

  const sampleContents = [
    "is a dedicated professional with extensive experience in systems design engineering. They have demonstrated expertise in innovative problem-solving approaches and sustainable technology solutions. Their educational background includes advanced studies at the University of Waterloo, where they developed strong analytical and technical skills in interdisciplinary collaboration and cutting-edge research projects.",

    "has significant professional experience including leadership roles in technology companies, academic research positions, and consulting work with industry partners. They have published numerous papers in peer-reviewed journals and have been recognized for their contributions to systems design engineering. They are known for their collaborative approach and ability to bridge theoretical concepts with practical applications in real-world scenarios.",

    "is actively involved in recent projects including development of innovative software solutions, participation in international research collaborations, and mentoring of junior researchers and students. They regularly speak at conferences and workshops, with their work being featured in industry publications and receiving recognition from professional engineering societies.",

    "has impressive educational achievements including degrees from top-tier universities, specialized certifications in emerging technologies, and continuous professional development through workshops and training programs. They maintain strong connections with academic institutions and industry partners, facilitating knowledge transfer and collaborative research opportunities in systems design.",

    "focuses on emerging technologies, sustainable development practices, and interdisciplinary research approaches. They are committed to advancing the field of systems design engineering through innovative research, practical applications, and knowledge sharing with the broader professional and academic community.",
  ]

  return {
    url,
    title: `${identifier} - Professional Information`,
    content: `${identifier} ${sampleContents[index % sampleContents.length]}`,
    metadata: {
      scrapedAt: new Date().toISOString(),
      wordCount: 150 + index * 50,
      domain: new URL(url).hostname,
    },
  }
}
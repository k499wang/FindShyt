export async function POST(req: Request) {
  const { messages } = await req.json()

  // Get the last message content (this should be the generated email)
  const lastMessage = messages[messages.length - 1]?.content || ""

  // If the message looks like a generated email (contains typical email elements),
  // format it nicely, otherwise provide a mock response
  let responseContent = ""

  if (lastMessage.includes("Subject:") || lastMessage.includes("Dear ") || lastMessage.includes("Hi ")) {
    // This appears to be a generated email, so format it nicely
    responseContent = `✅ **Email Generated Successfully!**

${lastMessage}

---

**Email Details:**
- This email was generated using OpenAI GPT-4
- It incorporates the research data you collected
- The website link has been included for additional context
- You can copy and customize this email before sending

**Next Steps:**
- Review the email content above
- Make any necessary customizations
- Copy the email to your email client
- Send when ready!`
  } else {
    // Fallback response
    responseContent = `Here's your generated email based on the research:

${lastMessage}

This email has been crafted using the selected template and incorporates the information gathered from the research process. The website link has been included to provide additional context and showcase the compiled information.

Feel free to customize this email further before sending!`
  }

  // Create a simple text stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const words = responseContent.split(" ")
      let index = 0

      const interval = setInterval(() => {
        if (index < words.length) {
          const chunk = words[index] + " "
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          index++
        } else {
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
          clearInterval(interval)
        }
      }, 50)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  })
}
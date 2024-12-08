import { env } from "@/env"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const { prompt, system } = await req.json()

  const apiKey = env.OPENAI_API_KEY
  const openai = createOpenAI({ apiKey, project: "tasklytic" })

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxTokens: 50,
      model: openai("gpt-4"),
      prompt,
      system,
      temperature: 0.7
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      !!error &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      return NextResponse.json(null, { status: 408 })
    }

    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    )
  }
}

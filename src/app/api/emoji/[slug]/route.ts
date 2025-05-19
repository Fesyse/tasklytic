import { getEmojiSlug } from "@/lib/utils"
import type { Emoji } from "frimousse"
import { NextResponse } from "next/server"

const EMOJI_DATA_URL = `https://cdn.jsdelivr.net/npm/emojibase-data@16.0.3`

async function getEmojiData() {
  "use cache"

  const response = await fetch(`${EMOJI_DATA_URL}/en/data.json`)
  if (!response.ok) {
    throw new Error(`Failed to fetch emoji data: ${response.statusText}`)
  }
  return response.json() as Promise<Emoji[]>
}

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params

  let emojiData: Emoji[]

  try {
    emojiData = await getEmojiData()
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to fetch emoji data: ${error instanceof Error ? error.message : "Unknown error"}`
      },
      { status: 500 }
    )
  }

  const emoji = emojiData.find((emoji) => getEmojiSlug(emoji.label) === slug)

  if (!emoji) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return new NextResponse(
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${emoji.label}"><title>${emoji.label}</title><text x="50%" y="50%" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji.emoji}</text></svg>`.trim(),
    {
      headers: { "Content-Type": "image/svg+xml" }
    }
  )
}

import { getEmojiSlug } from "@/lib/utils"
import type { Emoji } from "frimousse"
import { NextResponse } from "next/server"

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params

  const response = await fetch(
    `https://cdn.jsdelivr.net/npm/emojibase-data@latest/en/data.json`
  )
  const json = (await response.json()) as Emoji[]

  const emoji = json.find((emoji) => getEmojiSlug(emoji.label) === slug)

  if (!emoji) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return new NextResponse(
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50%" y="50%" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji.emoji}</text></svg>`.trim(),
    {
      headers: { "Content-Type": "image/svg+xml" }
    }
  )
}

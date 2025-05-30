import { env } from "@/env"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const secretKey = env.RECAPTCHA_SECRET_KEY

  const postData = await request.json()

  const { gRecaptchaToken } = postData

  const formData = `secret=${secretKey}&response=${gRecaptchaToken}`
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })

  if (!res.ok) return NextResponse.json({ success: false })

  const data = await res.json()

  if (data && data.success && data.score > 0.5) {
    console.log("data.score:", data.score)

    return NextResponse.json({
      success: true,
      score: data.score
    })
  } else {
    return NextResponse.json({ success: false })
  }
}

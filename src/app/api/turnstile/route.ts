import { env } from "@/env"
import { createId } from "@/server/db/schema"
import { validateTurnstileToken } from "next-turnstile"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  const validationResponse = await validateTurnstileToken({
    token,
    secretKey: env.TURNSTILE_SECRET_KEY,
    // Optional: Add an idempotency key to prevent token reuse
    idempotencyKey: createId(),
    sandbox: process.env.NODE_ENV === "development"
  })

  if (!validationResponse.success) {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}

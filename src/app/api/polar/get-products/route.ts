import { NextResponse } from "next/server"
import { polar } from "@/server/polar"

export async function GET() {
  try {
    const result = await polar.products.list({})

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.error()
  }
}

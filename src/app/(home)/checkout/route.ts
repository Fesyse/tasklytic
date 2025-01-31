import { type NextRequest, NextResponse } from "next/server"
import { polar } from "../../../server/polar"
import { auth } from "@/server/auth"

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.redirect(
      new URL(`/auth/sign-in?callbackUrl=${req.nextUrl.href}`, req.url)
    )
  }

  const url = new URL(req.url)
  const productPriceId = url.searchParams.get("priceId") ?? ""
  const successUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}/confirmation?checkout_id={CHECKOUT_ID}`

  try {
    const result = await polar.checkouts.custom.create({
      productPriceId,
      successUrl
    })

    return NextResponse.redirect(result.url)
  } catch (error) {
    console.error(error)
    return NextResponse.redirect(new URL(`/checkout/error`, req.url))
  }
}

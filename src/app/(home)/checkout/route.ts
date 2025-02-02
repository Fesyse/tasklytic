import { eq } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"
import { polar } from "../../../server/polar"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { users } from "@/server/db/schema"

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
    const customer = await polar.customers
      .get({ id: session.user.id })
      .catch(async () => {
        try {
          const customer = await polar.customers.create({
            email: session.user.email,
            name: session.user.name
          })
          await db
            .update(users)
            .set({
              customerId: customer.id
            })
            .where(eq(users.id, session.user.id))

          return customer
        } catch (error) {
          throw new Error(`[CHECKOUT][CREATE_CUSTOMER] Error: ${error}`)
        }
      })

    const result = await polar.checkouts.custom.create({
      productPriceId,
      successUrl,
      customerId: customer.id
    })

    return NextResponse.redirect(result.url)
  } catch (error) {
    console.error("[CHECKOUT] Error", error)
    return NextResponse.redirect(new URL(`/checkout/error`, req.url))
  }
}

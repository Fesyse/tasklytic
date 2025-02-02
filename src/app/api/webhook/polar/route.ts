import { Webhooks } from "@polar-sh/nextjs"
import { eq } from "drizzle-orm"
import { env } from "@/env"
import { db } from "@/server/db"
import { users } from "@/server/db/schema"

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async payload => {
    switch (payload.type) {
      case "checkout.created":
        // Handle the checkout created event
        console.log("checkout.created: ", payload)
        break
      case "checkout.updated":
        // Handle the checkout updated event
        // supabase.from('checkouts').update(webhookPayload.data).match({ id: webhookPayload.data.id })
        break
      case "subscription.created":
        // Handle the subscription created event
        await db
          .update(users)
          .set({
            subscriptionId: payload.data.id
          })
          .where(eq(users.customerId, payload.data.user.id))
      case "subscription.updated":
        // Handle the subscription updated event
        break
      case "subscription.active":
        // Handle the subscription active event
        break
      case "subscription.revoked":
        // Handle the subscription revoked event
        await db
          .update(users)
          .set({
            subscriptionId: null
          })
          .where(eq(users.customerId, payload.data.user.id))
        break
      case "subscription.canceled":
        // Handle the subscription canceled event
        await db
          .update(users)
          .set({
            subscriptionId: null
          })
          .where(eq(users.customerId, payload.data.user.id))
        break
      default:
        // Handle unknown event
        console.log("Unknown event", payload.type)
        break
    }
  }
})

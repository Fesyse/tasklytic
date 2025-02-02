import { Webhooks } from "@polar-sh/nextjs"
import { env } from "@/env"

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
        console.log("checkout.subscription: ", payload)
      case "subscription.updated":
        // Handle the subscription updated event
        break
      case "subscription.active":
        // Handle the subscription active event
        break
      case "subscription.revoked":
        // Handle the subscription revoked event
        break
      case "subscription.canceled":
        // Handle the subscription canceled event
        break
      default:
        // Handle unknown event
        console.log("Unknown event", payload.type)
        break
    }
  }
})

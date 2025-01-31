import { Polar } from "@polar-sh/sdk"
import { env } from "@/env"

export const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.NODE_ENV === "production" ? "production" : "sandbox" // Use sandbox for testing purposes - otherwise use 'production' or omit this line
})

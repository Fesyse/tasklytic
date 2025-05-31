import { env } from "@/env"
import { Redis } from "@upstash/redis"

export const kv = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN
})

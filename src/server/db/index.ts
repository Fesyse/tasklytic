import { env } from "@/env"
import * as schema from "@/server/db/schema"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Pool | undefined
}

export const client =
  globalForDb.client ?? new Pool({ connectionString: env.DATABASE_URL })
if (env.NODE_ENV !== "production") globalForDb.client = client

client.addListener("error", (err) => {
  console.error("[DATABASE] connection error:", err)
})

// Enhanced drizzle client with relations support
export const db = drizzle(client, {
  schema,
  logger: env.NODE_ENV === "development"
})

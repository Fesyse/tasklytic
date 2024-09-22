import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { env } from "@/env"

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  sql: postgres.Sql | undefined
}

const sql =
  globalForDb.sql ??
  postgres(env.DATABASE_URL, {
    ssl: env.NODE_ENV === "production" ? "require" : undefined
  })

if (env.NODE_ENV !== "production") globalForDb.sql = sql

export const db = drizzle(sql, { schema })

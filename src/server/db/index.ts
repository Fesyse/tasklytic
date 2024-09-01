import { type NeonQueryFunction, neon } from "@neondatabase/serverless"
import { drizzle as productionDrizzle } from "drizzle-orm/neon-http"
import { drizzle as developmentDrizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { env } from "@/env"

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  sql: postgres.Sql | NeonQueryFunction<false, false> | undefined
}

const sql =
  globalForDb.sql ??
  (env.NODE_ENV === "production"
    ? neon(env.POSTGRES_URL)
    : postgres(env.POSTGRES_URL))

globalForDb.sql = sql

export const db =
  env.NODE_ENV === "production"
    ? productionDrizzle(sql as NeonQueryFunction<false, false>, { schema })
    : developmentDrizzle(sql as postgres.Sql, { schema })

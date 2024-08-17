import { sql } from "@vercel/postgres"
import { drizzle as developmentDrizzle } from "drizzle-orm/postgres-js"
import { drizzle as productionDrizzle } from "drizzle-orm/vercel-postgres"
import postgres from "postgres"
import * as schema from "./schema"
import { env } from "@/env"

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined
}

const conn = globalForDb.conn ?? postgres(env.POSTGRES_URL)
if (env.NODE_ENV !== "production") globalForDb.conn = conn

export const db =
  env.NODE_ENV === "production"
    ? productionDrizzle(sql, { schema })
    : developmentDrizzle(conn, { schema })

import { env } from "@/env";
import { drizzle } from "drizzle-orm/singlestore";
import { dbCredentials } from "drizzle.config";
import { createPool, type Pool } from "mysql2/promise";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Pool | undefined;
};

export const client = globalForDb.client ?? createPool(dbCredentials);
if (env.NODE_ENV !== "production") globalForDb.client = client;

client.addListener("error", (err) => {
  console.error("[DATABASE] connection error:", err);
});

export const db = drizzle({ client, schema });

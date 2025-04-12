import { type Config } from "drizzle-kit";

import { env } from "@/env";

export const dbCredentials = {
  host: env.SINGLESTORE_HOST,
  user: env.SINGLESTORE_USER,
  password: env.SINGLESTORE_PASSWORD,
  port: env.SINGLESTORE_PORT,
  database: env.SINGLESTORE_DB_NAME,
  ssl: {},
};

export default {
  dialect: "singlestore",
  schema: "./src/server/db/schema.ts",
  dbCredentials: {
    host: env.SINGLESTORE_HOST,
    user: env.SINGLESTORE_USER,
    password: env.SINGLESTORE_PASSWORD,
    port: env.SINGLESTORE_PORT,
    database: env.SINGLESTORE_DB_NAME,
    ssl: {},
  },
  tablesFilter: ["froo_*"],
} satisfies Config;

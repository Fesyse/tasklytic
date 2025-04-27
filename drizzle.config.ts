import { type Config } from "drizzle-kit"

import { env } from "@/env"

export default {
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  dbCredentials: {
    url: env.DATABASE_URL
  },
  tablesFilter: ["froo_*"]
} satisfies Config

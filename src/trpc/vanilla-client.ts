"use client"

import { getBaseUrl } from "@/lib/utils"
import { type AppRouter } from "@/server/api/root"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import { SuperJSON } from "superjson"

export const trpcOptions = {
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error)
    }),
    httpBatchStreamLink({
      transformer: SuperJSON,
      url: getBaseUrl() + "/api/trpc",
      headers: () => {
        const headers = new Headers()
        headers.set("x-trpc-source", "nextjs-react")
        return headers
      }
    })
  ]
}

export const apiVanilla = createTRPCClient<AppRouter>(trpcOptions)

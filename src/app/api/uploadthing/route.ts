import { createRouteHandler } from "uploadthing/next"
import { env } from "@/env"
import { fileRouter } from "@/server/file-upload"

export const { GET, POST } = createRouteHandler({
  router: fileRouter,
  config: {
    token: env.UPLOADTHING_TOKEN
  }
})

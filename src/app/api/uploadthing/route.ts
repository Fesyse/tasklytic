import { createRouteHandler } from "uploadthing/next"
import { env } from "@/env"
import { fileRouter } from "@/server/file-upload"

const handler = createRouteHandler({
  router: fileRouter,
  config: {
    token: env.UPLOADTHING_TOKEN
  }
})
export { handler as GET, handler as POST }

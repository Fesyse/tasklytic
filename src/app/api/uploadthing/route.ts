import { fileRouter } from "@/server/file-upload"
import { createRouteHandler } from "uploadthing/next"

export const { GET, POST } = createRouteHandler({
  router: fileRouter
})

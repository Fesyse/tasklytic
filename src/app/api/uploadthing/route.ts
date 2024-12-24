import { createRouteHandler } from "uploadthing/next"
import { fileRouter } from "@/server/file-upload"

export const { GET, POST } = createRouteHandler({
  router: fileRouter
})

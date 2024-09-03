import { createRouteHandler } from "uploadthing/next"
import { fileRouter } from "@/server/file-upload"

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: fileRouter
})

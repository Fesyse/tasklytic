import { createRouteHandler } from "uploadthing/next"

import { fileRouter } from "@/server/uploadthing"

export const { GET, POST } = createRouteHandler({ router: fileRouter })

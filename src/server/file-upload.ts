import {
  type FileRouter as _FileRouter,
  createUploadthing
} from "uploadthing/next"
import { UTApi, UploadThingError } from "uploadthing/server"
import { auth } from "@/server/auth"

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const fileRouter = {
  imageUploader: f({
    image: { maxFileSize: "1MB", maxFileCount: 1, minFileCount: 1 }
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({
        headers: req.headers
      })

      if (!session) throw new UploadThingError("Unauthorized")
      else return { session }
    })
    .onUploadComplete(() => {
      return
    }),
  editorUploader: f(["image", "text", "blob", "pdf", "video", "audio"])
    .middleware(() => {
      return {}
    })
    .onUploadComplete(({ file }) => {
      return { file }
    })
} satisfies _FileRouter

export type FileRouter = typeof fileRouter

export const utapi = new UTApi()

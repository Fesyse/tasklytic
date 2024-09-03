import { toast } from "sonner"
import {
  type FileRouter as _FileRouter,
  createUploadthing
} from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { auth } from "@/server/auth"

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const fileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: { maxFileSize: "1MB", maxFileCount: 1, minFileCount: 1 }
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await auth()

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError("Unauthorized")
      else return {}
    })
    .onUploadComplete(() => {
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      toast.success("Successfully uploaded image!")
    })
} satisfies _FileRouter

export type FileRouter = typeof fileRouter

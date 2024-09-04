import { toast } from "sonner"
import {
  type FileRouter as _FileRouter,
  createUploadthing
} from "uploadthing/next"
import { UTApi, UploadThingError } from "uploadthing/server"
import { MAX_FILE_SIZE } from "@/lib/constants"
import { auth } from "@/server/auth"

const f = createUploadthing()

export const fileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: MAX_FILE_SIZE.string,
      maxFileCount: 1,
      minFileCount: 1
    }
  })
    .middleware(async () => {
      // this throws an error
      const session = await auth()

      if (!session) throw new UploadThingError("Unauthorized")
      else return {}
    })
    .onUploadComplete(() => {
      toast.success("Successfully uploaded image!")
    })
} satisfies _FileRouter
export type FileRouter = typeof fileRouter

// this throws an error
export const utapi = new UTApi()

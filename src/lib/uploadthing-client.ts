import type { FileRouter } from "@/server/uploadthing"
import { genUploader } from "uploadthing/client"
import { tryCatch } from "./utils"

export const { uploadFiles } = genUploader<FileRouter>()

export const uploadFile = async (file: File, uploader: keyof FileRouter) => {
  const { data: res, error } = await tryCatch(
    uploadFiles(uploader, {
      files: [file]
    })
  )

  if (error) {
    return { data: undefined, error }
  }

  return { data: res[0]?.ufsUrl, error: undefined }
}

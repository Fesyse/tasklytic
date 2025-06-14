import type {
  FileRouter,
  FileRouter as OurFileRouter
} from "@/server/uploadthing"
import {
  generateUploadButton,
  generateUploadDropzone
} from "@uploadthing/react"
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

export const UploadDropzone = generateUploadDropzone<OurFileRouter>()
export const UploadButton = generateUploadButton<OurFileRouter>()

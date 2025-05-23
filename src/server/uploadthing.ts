import type { FileRouter as UploadThingFileRouter } from "uploadthing/next"
import { createUploadthing } from "uploadthing/next"
import { UTApi } from "uploadthing/server"

const f = createUploadthing()

export const fileRouter = {
  editorUploader: f(["image", "text", "blob", "pdf", "video", "audio"])
    .middleware(() => {
      return {}
    })
    .onUploadComplete(({ file }) => {
      return {
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl
      }
    }),
  profileImageUploader: f(["image"])
    .middleware(() => {
      return {}
    })
    .onUploadComplete(({ file }) => {
      return {
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl
      }
    })
} satisfies UploadThingFileRouter

export const utApi = new UTApi()

export type FileRouter = typeof fileRouter

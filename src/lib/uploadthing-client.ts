import type { FileRouter } from "@/server/uploadthing"
import { genUploader } from "uploadthing/client"

export const { uploadFiles } = genUploader<FileRouter>()

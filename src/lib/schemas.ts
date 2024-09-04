import { z } from "zod"
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  NAVIGATION_MENU
} from "@/lib/constants"

const settingsSchema = z.object({
  sidebar: z.object({
    isOpen: z.boolean().default(false)
  }),
  navigationMenu: z.enum(NAVIGATION_MENU)
})

type SettingsSchema = z.infer<typeof settingsSchema>

const createProjectSchema = z.object({
  name: z
    .string()
    .max(20, { message: "Project name cannot exceed 20 characters" }),
  icon: z
    .custom<File | null>()
    .refine(file => !file || file?.size <= MAX_FILE_SIZE.number, {
      message: `Max image size is ${MAX_FILE_SIZE.string}.`
    })
    .refine(
      file => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png, .webp, files are accepted only"
    )
})

type CreateProjectSchema = z.infer<typeof createProjectSchema>

export {
  settingsSchema,
  type SettingsSchema,
  createProjectSchema,
  type CreateProjectSchema
}

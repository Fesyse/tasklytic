import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants"
import { z } from "zod"

const settingsSchema = z.object({
  sidebar: z.object({
    isOpen: z.boolean().default(false)
  })
})
type SettingsSchema = z.infer<typeof settingsSchema>

const createProjectSchema = z.object({
  name: z
    .string()
    .max(20, { message: "Project name cannot exceed 20 characters" }),
  checkIcon: z.boolean().default(false),
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

const updateProjectSchema = z.object({
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
    .or(z.literal("DELETE"))
})
type UpdateProjectSchema = z.infer<typeof updateProjectSchema>

const blockContent = z.array(
  z.object({
    id: z.string(),
    children: z.array(z.any()),
    type: z.string()
  })
)

export {
  blockContent,
  createProjectSchema,
  settingsSchema,
  updateProjectSchema,
  type CreateProjectSchema,
  type SettingsSchema,
  type UpdateProjectSchema
}

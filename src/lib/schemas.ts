import { z } from "zod"
import { NAVIGATION_MENU } from "@/lib/constants"

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
    .max(20, { message: "Project name cannot exceed 20 characters" })
})

type CreateProjectSchema = z.infer<typeof createProjectSchema>

export {
  settingsSchema,
  type SettingsSchema,
  createProjectSchema,
  type CreateProjectSchema
}

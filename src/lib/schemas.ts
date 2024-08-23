import { z } from "zod"
import { NAVIGATION_MENU } from "@/lib/constants"

const settingsSchema = z.object({
  sidebar: z.object({
    isOpen: z.boolean().default(false)
  }),
  navigationMenu: z.enum(NAVIGATION_MENU)
})

type SettingsSchema = z.infer<typeof settingsSchema>

export { settingsSchema, type SettingsSchema }

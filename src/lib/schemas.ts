import { z } from "zod"

const settingsSchema = z.object({
  sidebar: z.object({
    isOpen: z.boolean().default(false)
  }),
  navigationMenu: z.enum(["sidebar", "floating-dock"])
})

type SettingsSchema = z.infer<typeof settingsSchema>

export { settingsSchema, type SettingsSchema }

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useUserSettingsStore } from "@/components/providers/user-settings-store-provider"
import { Form } from "@/components/ui/form"
import { type SettingsSchema, settingsSchema } from "@/lib/schemas"

export const Settings = () => {
  const settingsStore = useUserSettingsStore(s => s)
  const form = useForm<SettingsSchema>({
    defaultValues: {
      sidebar: {
        isOpen: settingsStore.sidebar.isOpen
      },
      navigationMenu: settingsStore.navigationMenu
    },
    resolver: zodResolver(settingsSchema)
  })

  return (
    <Form {...form}>
      <form></form>
    </Form>
  )
}

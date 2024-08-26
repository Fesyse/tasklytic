"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useStore } from "@/hooks/use-store"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { NAVIGATION_MENU } from "@/lib/constants"
import { type SettingsSchema, settingsSchema } from "@/lib/schemas"
import { title } from "@/lib/utils"
import { useUserSettingsStore } from "@/stores/user-settings.store"

export const Settings = () => {
  const settingsStore = useStore(useUserSettingsStore, s => s)
  if (!settingsStore) return null

  const form = useForm<SettingsSchema>({
    defaultValues: {
      sidebar: {
        isOpen: settingsStore.sidebar.isOpen
      },
      navigationMenu: settingsStore.navigationMenu
    },
    resolver: zodResolver(settingsSchema)
  })

  const onSubmit = (data: SettingsSchema) => {
    settingsStore.updateUserSettingsStore(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormField
          name="navigationMenu"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Navigation menu</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select navigation menu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {NAVIGATION_MENU.map(menu => (
                      <SelectItem key={menu} value={menu}>
                        {title(menu)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>
                Select navigation menu to match your preferences.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Apply changes</Button>
      </form>
    </Form>
  )
}

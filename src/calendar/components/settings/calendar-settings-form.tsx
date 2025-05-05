"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import { TBadgeVariant, TCalendarView } from "@/calendar/types"
import { api } from "@/trpc/react"
import { toast } from "sonner"

const formSchema = z.object({
  defaultView: z.enum(["day", "week", "month", "year", "agenda"]),
  visibleHoursFrom: z.coerce.number().min(0).max(23),
  visibleHoursTo: z.coerce.number().min(1).max(24),
  badgeVariant: z.enum(["dot", "text"])
})

export function CalendarSettingsForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const { data: calendarSettings, isLoading } =
    api.calendar.getCalendarSettings.useQuery()
  const { mutate: updateSettings } =
    api.calendar.updateCalendarSettings.useMutation({
      onSuccess: () => {
        toast.success("Settings Updated", {
          description: "Your calendar settings have been updated successfully."
        })
        router.refresh()
        setIsSaving(false)
      },
      onError: (error) => {
        toast({
          title: "Error",
          description:
            error.message || "Failed to update settings. Please try again.",
          variant: "destructive"
        })
        setIsSaving(false)
      }
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultView: (calendarSettings?.defaultView as TCalendarView) || "month",
      visibleHoursFrom: calendarSettings?.visibleHoursFrom || 8,
      visibleHoursTo: calendarSettings?.visibleHoursTo || 18,
      badgeVariant: (calendarSettings?.badgeVariant as TBadgeVariant) || "dot"
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true)
    updateSettings(values)
  }

  if (isLoading) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Preferences</CardTitle>
        <CardDescription>
          Configure how your calendar looks and behaves
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="defaultView"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default View</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a view" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                      <SelectItem value="agenda">Agenda</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The default calendar view when opening the calendar page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visibleHoursFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Hour</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={23} {...field} />
                    </FormControl>
                    <FormDescription>
                      First visible hour in day/week view.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibleHoursTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Hour</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={24} {...field} />
                    </FormControl>
                    <FormDescription>
                      Last visible hour in day/week view.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="badgeVariant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Indicator Style</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select indicator style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dot">Dot</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How events are displayed in month and year views.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

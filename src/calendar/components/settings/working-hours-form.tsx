"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
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
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { api } from "@/trpc/react"
import { toast } from "sonner"

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]

const hourOptions = Array.from({ length: 25 }, (_, i) => ({
  value: i.toString(),
  label:
    i === 0 ? "12 AM" : i === 12 ? "12 PM" : i < 12 ? `${i} AM` : `${i - 12} PM`
}))

const workingHourSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  enabled: z.boolean(),
  fromHour: z.coerce.number().min(0).max(23),
  toHour: z.coerce.number().min(1).max(24)
})

const formSchema = z.object({
  workingHours: z.array(workingHourSchema).refine(
    (hours) => {
      // Check that for each enabled day, toHour > fromHour
      return hours.every((hour) => !hour.enabled || hour.toHour > hour.fromHour)
    },
    {
      message: "End time must be after start time",
      path: ["workingHours"]
    }
  )
})

export function WorkingHoursForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const { data: workingHours, isLoading } =
    api.calendar.getWorkingHours.useQuery()
  const { mutate: updateWorkingHours } =
    api.calendar.updateWorkingHours.useMutation({
      onSuccess: () => {
        toast.success("Working Hours Updated", {
          description: "Your working hours have been updated successfully."
        })
        router.refresh()
        setIsSaving(false)
      },
      onError: (error) => {
        toast.error("Error", {
          description:
            error.message || "Failed to update working hours. Please try again."
        })
        setIsSaving(false)
      }
    })

  // Initialize the form with default values
  const defaultWorkingHours = dayNames.map((_, index) => {
    const daySettings = workingHours?.[index]
    return {
      dayOfWeek: index,
      enabled: daySettings?.enabled ?? (index > 0 && index < 6), // Monday-Friday enabled by default
      fromHour: daySettings?.fromHour ?? 9,
      toHour: daySettings?.toHour ?? 17
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workingHours: defaultWorkingHours
    }
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "workingHours"
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true)
    updateWorkingHours(values.workingHours)
  }

  if (isLoading) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours</CardTitle>
        <CardDescription>
          Set your working hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[120px_1fr_1fr] items-center gap-4"
                >
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`workingHours.${index}.enabled`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-medium">
                            {dayNames[index]}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`workingHours.${index}.fromHour`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            disabled={
                              !form.watch(`workingHours.${index}.enabled`)
                            }
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {hourOptions.slice(0, 24).map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`workingHours.${index}.toHour`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            disabled={
                              !form.watch(`workingHours.${index}.enabled`)
                            }
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="End time" />
                            </SelectTrigger>
                            <SelectContent>
                              {hourOptions.slice(1).map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

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

"use client"

import { useCalendar } from "@/calendar/contexts/calendar-context"
import type { TEventFormData } from "@/calendar/schemas"
import { addDays, addHours, addMinutes } from "date-fns"

export function useAddEvent() {
  const { createEvent } = useCalendar()

  const addEvent = (formData: TEventFormData) => {
    // Create start date with time
    let startDate = formData.startDate
    if (startDate && formData.startTime) {
      startDate = addHours(startDate, formData.startTime.hour)
      startDate = addMinutes(startDate, formData.startTime.minute)
    }

    // If no end date specified, default to same day as start
    let endDate =
      formData.endDate || (startDate ? addDays(startDate, 0) : new Date())
    if (endDate && formData.endTime) {
      endDate = addHours(endDate, formData.endTime.hour)
      endDate = addMinutes(endDate, formData.endTime.minute)
    }

    // Add event using the context method
    createEvent({
      title: formData.title,
      description: formData.description || "",
      startDate: startDate?.toISOString() || new Date().toISOString(),
      endDate: endDate?.toISOString() || new Date().toISOString(),
      color: formData.color || "blue",
      user: {
        id: formData.user || "1", // Default to first user if none selected
        name: "Default User",
        picturePath: ""
      }
    })
  }

  return { addEvent }
}

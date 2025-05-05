"use client"

import { useCalendar } from "@/calendar/contexts/calendar-context"
import { toast } from "sonner"

export function useDeleteEvent() {
  const { deleteEvent: deleteEventFromContext } = useCalendar()

  const deleteEvent = (id: string | number) => {
    try {
      deleteEventFromContext(id)
      toast.success("Event deleted successfully")
    } catch (error) {
      toast.error("Failed to delete event")
      console.error(error)
    }
  }

  return { deleteEvent }
}

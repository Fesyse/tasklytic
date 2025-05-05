import { useCalendar } from "@/calendar/contexts/calendar-context"

import type { IEvent } from "@/calendar/interfaces"

export function useUpdateEvent() {
  const { updateEvent: updateEventFromContext } = useCalendar()

  // Format the event and call the context method that will use the API
  const updateEvent = (event: IEvent) => {
    const newEvent: IEvent = {
      ...event,
      startDate: new Date(event.startDate).toISOString(),
      endDate: new Date(event.endDate).toISOString()
    }

    updateEventFromContext(newEvent)
  }

  return { updateEvent }
}

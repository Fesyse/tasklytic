"use client"

import { createContext, useContext, useEffect, useState } from "react"

import type { IEvent, IUser } from "@/calendar/interfaces"
import type {
  TBadgeVariant,
  TVisibleHours,
  TWorkingHours
} from "@/calendar/types"
import { api } from "@/trpc/react"
import { parseAsIsoDateTime, useQueryState } from "nuqs"
import type { Dispatch, SetStateAction } from "react"

interface ICalendarContext {
  selectedDate: Date
  setSelectedDate: (date: Date | undefined) => void
  selectedUserId: IUser["id"] | "all"
  setSelectedUserId: (userId: IUser["id"] | "all") => void
  badgeVariant: TBadgeVariant
  setBadgeVariant: (variant: TBadgeVariant) => void
  users: IUser[] | undefined
  workingHours: TWorkingHours
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>
  visibleHours: TVisibleHours
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>
  events: IEvent[] | undefined
  updateEvent: (updatedEvent: IEvent) => void
  createEvent: (newEvent: Omit<IEvent, "id">) => void
  deleteEvent: (eventId: string | number) => void
  isLoading: boolean
}

const CalendarContext = createContext({} as ICalendarContext)

const DEFAULT_WORKING_HOURS = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 0, to: 0 }
}

const DEFAULT_VISIBLE_HOURS = { from: 7, to: 18 }

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useQueryState("selected-date", {
    ...parseAsIsoDateTime,
    defaultValue: new Date()
  })
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">(
    "all"
  )

  // Use deferred data fetching for settings to improve initial load
  const { data: settingsData } = api.calendar.getCalendarSettings.useQuery(
    undefined,
    {
      initialData: {
        defaultView: "month",
        defaultBadgeVariant: "colored",
        visibleHoursFrom: 7,
        visibleHoursTo: 18
      },
      staleTime: 5 * 60 * 1000 // Cache settings for 5 minutes
    }
  )

  // Fetch working hours with a longer stale time
  const { data: workingHoursData } = api.calendar.getWorkingHours.useQuery(
    undefined,
    {
      initialData: DEFAULT_WORKING_HOURS,
      staleTime: 10 * 60 * 1000 // Cache working hours for 10 minutes
    }
  )

  // Settings state derived from server data
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>(
    (settingsData?.defaultBadgeVariant as TBadgeVariant) || "dot"
  )

  const [visibleHours, setVisibleHours] = useState<TVisibleHours>({
    from: settingsData?.visibleHoursFrom || DEFAULT_VISIBLE_HOURS.from,
    to: settingsData?.visibleHoursTo || DEFAULT_VISIBLE_HOURS.to
  })

  const [workingHours, setWorkingHours] = useState<TWorkingHours>(
    workingHoursData || DEFAULT_WORKING_HOURS
  )

  // Update local state when settings change from server
  useEffect(() => {
    if (settingsData) {
      setBadgeVariant(
        (settingsData.defaultBadgeVariant as TBadgeVariant) || "dot"
      )
      setVisibleHours({
        from: settingsData.visibleHoursFrom || DEFAULT_VISIBLE_HOURS.from,
        to: settingsData.visibleHoursTo || DEFAULT_VISIBLE_HOURS.to
      })
    }
  }, [settingsData])

  // Update local state when working hours change from server
  useEffect(() => {
    if (workingHoursData) {
      setWorkingHours(workingHoursData)
    }
  }, [workingHoursData])

  // Optimize events loading: Only fetch events near the selected date
  // This significantly reduces initial data load
  const startOfMonth = new Date(selectedDate)
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const endOfMonth = new Date(selectedDate)
  endOfMonth.setMonth(endOfMonth.getMonth() + 1)
  endOfMonth.setDate(0)
  endOfMonth.setHours(23, 59, 59, 999)

  // Events operations with date range filter to reduce payload size
  const { data: events, isLoading: isEventsLoading } =
    api.calendar.getEvents.useQuery(
      {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString()
      },
      {
        staleTime: 30 * 1000 // Cache for 30 seconds
      }
    )

  // Lazy load users only when needed
  const { data: users, isLoading: isUsersLoading } =
    api.calendar.getUsers.useQuery(undefined, {
      staleTime: 5 * 60 * 1000 // Cache users for 5 minutes
    })

  const utils = api.useUtils()

  // Mutations for CRUD operations
  const { mutate: createEventMutation } = api.calendar.createEvent.useMutation({
    onSuccess: () => utils.calendar.getEvents.invalidate()
  })

  const { mutate: updateEventMutation } = api.calendar.updateEvent.useMutation({
    onSuccess: () => utils.calendar.getEvents.invalidate()
  })

  const { mutate: deleteEventMutation } = api.calendar.deleteEvent.useMutation({
    onSuccess: () => utils.calendar.getEvents.invalidate()
  })

  const createEvent = (newEvent: Omit<IEvent, "id">) => {
    createEventMutation({
      title: newEvent.title,
      description: newEvent.description || "",
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      color: newEvent.color
    })
  }

  const updateEvent = (updatedEvent: IEvent) => {
    updateEventMutation({
      id: String(updatedEvent.id),
      title: updatedEvent.title,
      description: updatedEvent.description || "",
      startDate: updatedEvent.startDate,
      endDate: updatedEvent.endDate,
      color: updatedEvent.color
    })
  }

  const deleteEvent = (eventId: string | number) => {
    deleteEventMutation({ id: String(eventId) })
  }

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
  }

  const isLoading = isEventsLoading || isUsersLoading

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate: handleSelectDate,
        selectedUserId,
        setSelectedUserId,
        badgeVariant,
        setBadgeVariant,
        users,
        visibleHours,
        setVisibleHours,
        workingHours,
        setWorkingHours,
        events,
        updateEvent,
        createEvent,
        deleteEvent,
        isLoading
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext)
  if (!context)
    throw new Error("useCalendar must be used within a CalendarProvider.")
  return context
}

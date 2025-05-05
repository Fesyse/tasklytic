"use client"

import { createContext, useContext, useEffect, useState } from "react"

import type { IEvent, IUser } from "@/calendar/interfaces"
import type {
  TBadgeVariant,
  TVisibleHours,
  TWorkingHours
} from "@/calendar/types"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import type { Dispatch, SetStateAction } from "react"

interface ICalendarContext {
  selectedDate: Date
  setSelectedDate: (date: Date | undefined) => void
  selectedUserId: IUser["id"] | "all"
  setSelectedUserId: (userId: IUser["id"] | "all") => void
  badgeVariant: TBadgeVariant
  setBadgeVariant: (variant: TBadgeVariant) => void
  users: IUser[]
  workingHours: TWorkingHours
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>
  visibleHours: TVisibleHours
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>
  events: IEvent[]
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

export function CalendarProvider({
  children,
  initialUsers,
  initialEvents
}: {
  children: React.ReactNode
  initialUsers: IUser[]
  initialEvents: IEvent[]
}) {
  const router = useRouter()

  // Server data state
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">(
    "all"
  )

  // Fetch settings from server
  const { data: settingsData } = api.calendar.getCalendarSettings.useQuery(
    undefined,
    {
      initialData: {
        defaultView: "month",
        defaultBadgeVariant: "colored",
        visibleHoursFrom: 7,
        visibleHoursTo: 18
      }
    }
  )

  // Fetch working hours from server
  const { data: workingHoursData } = api.calendar.getWorkingHours.useQuery(
    undefined,
    {
      initialData: DEFAULT_WORKING_HOURS
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

  // Events operations
  const { data: events = initialEvents, isLoading: isEventsLoading } =
    api.calendar.getEvents.useQuery()
  const { data: users = initialUsers, isLoading: isUsersLoading } =
    api.calendar.getUsers.useQuery()

  // Mutations for CRUD operations
  const { mutate: createEventMutation } = api.calendar.createEvent.useMutation({
    onSuccess: () => {
      router.refresh()
    }
  })

  const { mutate: updateEventMutation } = api.calendar.updateEvent.useMutation({
    onSuccess: () => {
      router.refresh()
    }
  })

  const { mutate: deleteEventMutation } = api.calendar.deleteEvent.useMutation({
    onSuccess: () => {
      router.refresh()
    }
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

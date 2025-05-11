"use client"

import { isSameDay, parseISO } from "date-fns"
import { lazy, Suspense, useMemo } from "react"

import { CalendarSkeleton } from "@/calendar/components/loading"
import { useCalendar } from "@/calendar/contexts/calendar-context"

import { DndProviderWrapper } from "@/calendar/components/dnd/dnd-provider"

import { CalendarHeader } from "@/calendar/components/header/calendar-header"
import type { TCalendarView } from "@/calendar/types"

// Dynamically import view components to improve initial load time
const CalendarAgendaView = lazy(() =>
  import("@/calendar/components/agenda-view/calendar-agenda-view").then(
    (mod) => ({ default: mod.CalendarAgendaView })
  )
)
const CalendarMonthView = lazy(() =>
  import("@/calendar/components/month-view/calendar-month-view").then(
    (mod) => ({ default: mod.CalendarMonthView })
  )
)
const CalendarDayView = lazy(() =>
  import("@/calendar/components/week-and-day-view/calendar-day-view").then(
    (mod) => ({ default: mod.CalendarDayView })
  )
)
const CalendarWeekView = lazy(() =>
  import("@/calendar/components/week-and-day-view/calendar-week-view").then(
    (mod) => ({ default: mod.CalendarWeekView })
  )
)
const CalendarYearView = lazy(() =>
  import("@/calendar/components/year-view/calendar-year-view").then((mod) => ({
    default: mod.CalendarYearView
  }))
)

interface IProps {
  view: TCalendarView
}

export function CalendarContent({ view }: IProps) {
  const { selectedDate, selectedUserId, events, isLoading } = useCalendar()

  if (isLoading) {
    return <CalendarSkeleton view={view} />
  }

  const filteredEvents = useMemo(() => {
    return (events ?? []).filter((event) => {
      const eventStartDate = parseISO(event.startDate)
      const eventEndDate = parseISO(event.endDate)

      if (view === "year") {
        const yearStart = new Date(selectedDate.getFullYear(), 0, 1)
        const yearEnd = new Date(
          selectedDate.getFullYear(),
          11,
          31,
          23,
          59,
          59,
          999
        )
        const isInSelectedYear =
          eventStartDate <= yearEnd && eventEndDate >= yearStart
        const isUserMatch =
          selectedUserId === "all" || event.user.id === selectedUserId
        return isInSelectedYear && isUserMatch
      }

      if (view === "month" || view === "agenda") {
        const monthStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        )
        const monthEnd = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        )
        const isInSelectedMonth =
          eventStartDate <= monthEnd && eventEndDate >= monthStart
        const isUserMatch =
          selectedUserId === "all" || event.user.id === selectedUserId
        return isInSelectedMonth && isUserMatch
      }

      if (view === "week") {
        const dayOfWeek = selectedDate.getDay()

        const weekStart = new Date(selectedDate)
        weekStart.setDate(selectedDate.getDate() - dayOfWeek)
        weekStart.setHours(0, 0, 0, 0)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

        const isInSelectedWeek =
          eventStartDate <= weekEnd && eventEndDate >= weekStart
        const isUserMatch =
          selectedUserId === "all" || event.user.id === selectedUserId
        return isInSelectedWeek && isUserMatch
      }

      if (view === "day") {
        const dayStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          0,
          0,
          0
        )
        const dayEnd = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59
        )
        const isInSelectedDay =
          eventStartDate <= dayEnd && eventEndDate >= dayStart
        const isUserMatch =
          selectedUserId === "all" || event.user.id === selectedUserId
        return isInSelectedDay && isUserMatch
      }

      return false
    })
  }, [selectedDate, selectedUserId, events, view])

  const singleDayEvents = filteredEvents?.filter((event) => {
    const startDate = parseISO(event.startDate)
    const endDate = parseISO(event.endDate)
    return isSameDay(startDate, endDate)
  })

  const multiDayEvents = filteredEvents?.filter((event) => {
    const startDate = parseISO(event.startDate)
    const endDate = parseISO(event.endDate)
    return !isSameDay(startDate, endDate)
  })

  // For year view, we only care about the start date
  // by using the same date for both start and end,
  // we ensure only the start day will show a dot
  const eventStartDates = useMemo(() => {
    return filteredEvents?.map((event) => ({
      ...event,
      endDate: event.startDate
    }))
  }, [filteredEvents])

  const renderViewComponent = () => {
    // Only render the view that's currently active to reduce initial load
    const ViewComponent = () => {
      switch (view) {
        case "day":
          return (
            <CalendarDayView
              singleDayEvents={singleDayEvents}
              multiDayEvents={multiDayEvents}
            />
          )
        case "month":
          return (
            <CalendarMonthView
              singleDayEvents={singleDayEvents}
              multiDayEvents={multiDayEvents}
            />
          )
        case "week":
          return (
            <CalendarWeekView
              singleDayEvents={singleDayEvents}
              multiDayEvents={multiDayEvents}
            />
          )
        case "year":
          return <CalendarYearView allEvents={eventStartDates} />
        case "agenda":
          return (
            <CalendarAgendaView
              singleDayEvents={singleDayEvents}
              multiDayEvents={multiDayEvents}
            />
          )
        default:
          return null
      }
    }

    return (
      <Suspense fallback={<div className="p-4">Loading view...</div>}>
        <ViewComponent />
      </Suspense>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeader events={filteredEvents} />

      <DndProviderWrapper>{renderViewComponent()}</DndProviderWrapper>
    </div>
  )
}

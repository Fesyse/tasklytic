import { Skeleton } from "@/components/ui/skeleton"
import { memo } from "react"
import type { TCalendarView } from "../types"

export function CalendarHeaderSkeleton() {
  return (
    <div className="border-b p-2">
      <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="bg-border h-8 w-px" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <div className="bg-border h-8 w-px" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function CalendarMonthViewSkeleton() {
  return (
    <div className="grid h-[600px] auto-rows-fr grid-cols-7">
      {Array.from({ length: 7 }).map((_, dayIndex) => (
        <div key={`day-header-${dayIndex}`} className="border-r border-b p-2">
          <Skeleton className="mx-auto h-5 w-20 rounded-md" />
        </div>
      ))}
      {Array.from({ length: 35 }).map((_, cellIndex) => (
        <div
          key={`cell-${cellIndex}`}
          className="relative border-r border-b p-2"
        >
          <Skeleton className="absolute top-2 left-2 h-5 w-5 rounded-md" />
          {/* Random number of event skeletons (0-3) */}
          {Array.from({ length: Math.floor(Math.random() * 4) }).map(
            (_, eventIndex) => (
              <Skeleton
                key={`event-${cellIndex}-${eventIndex}`}
                className="mx-auto mb-1 h-6 w-[75%] rounded-md"
              />
            )
          )}
        </div>
      ))}
    </div>
  )
}

export function CalendarWeekViewSkeleton() {
  return (
    <div className="flex h-[600px] flex-col">
      <div className="grid grid-cols-8 border-b">
        <div className="border-r p-2">
          <Skeleton className="mx-auto h-5 w-16" />
        </div>
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <div key={`day-header-${dayIndex}`} className="border-r p-2">
            <Skeleton className="mx-auto h-5 w-20" />
          </div>
        ))}
      </div>
      <div className="grid h-full grid-cols-8">
        <div className="border-r">
          {Array.from({ length: 12 }).map((_, hourIndex) => (
            <div key={`hour-${hourIndex}`} className="h-12 border-b p-2">
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
        <div className="col-span-7 grid grid-cols-7">
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div key={`day-${dayIndex}`} className="border-r">
              {Array.from({ length: 12 }).map((_, hourIndex) => (
                <div
                  key={`hour-${hourIndex}`}
                  className="relative h-12 border-b p-2"
                >
                  {Math.random() > 0.8 && (
                    <Skeleton className="absolute inset-x-1 h-10 rounded-md" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CalendarDayViewSkeleton() {
  return (
    <div className="flex h-[600px] flex-col">
      <div className="grid grid-cols-2 border-b">
        <div className="border-r p-2">
          <Skeleton className="mx-auto h-5 w-16" />
        </div>
        <div className="p-2">
          <Skeleton className="mx-auto h-5 w-20" />
        </div>
      </div>
      <div className="grid h-full grid-cols-2">
        <div className="border-r">
          {Array.from({ length: 12 }).map((_, hourIndex) => (
            <div key={`hour-${hourIndex}`} className="h-12 border-b p-2">
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
        <div>
          {Array.from({ length: 12 }).map((_, hourIndex) => (
            <div
              key={`hour-${hourIndex}`}
              className="relative h-12 border-b p-2"
            >
              {Math.random() > 0.7 && (
                <Skeleton className="absolute inset-x-1 h-10 rounded-md" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CalendarYearViewSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {Array.from({ length: 12 }).map((_, monthIndex) => (
        <div key={`month-${monthIndex}`} className="rounded-md border">
          <div className="border-b p-2">
            <Skeleton className="mx-auto h-5 w-24" />
          </div>
          <div className="grid grid-cols-7 gap-1 p-2">
            {Array.from({ length: 31 }).map((_, dayIndex) => (
              <Skeleton
                key={`day-${monthIndex}-${dayIndex}`}
                className="mx-auto h-7 w-7 rounded-full"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CalendarAgendaViewSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, dayIndex) => (
        <div key={`day-${dayIndex}`} className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-2">
            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(
              (_, eventIndex) => (
                <div
                  key={`event-${dayIndex}-${eventIndex}`}
                  className="flex justify-between rounded-md border p-3"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-60" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function CalendarSkeleton({ view }: { view: TCalendarView }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeaderSkeleton />
      {view === "month" && <CalendarMonthViewSkeleton />}
      {view === "week" && <CalendarWeekViewSkeleton />}
      {view === "day" && <CalendarDayViewSkeleton />}
      {view === "year" && <CalendarYearViewSkeleton />}
      {view === "agenda" && <CalendarAgendaViewSkeleton />}
    </div>
  )
}

const CalendarSkeletonMemoized = memo(CalendarSkeleton)

export { CalendarSkeletonMemoized as CalendarSkeleton }

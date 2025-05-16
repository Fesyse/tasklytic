import { formatDate } from "date-fns"

import { useCalendar } from "@/calendar/contexts/calendar-context"

export function TodayButton() {
  const { setSelectedDate } = useCalendar()

  const today = new Date()
  const handleClick = () => setSelectedDate(today)

  return (
    <button
      className="focus-visible:ring-ring flex size-14 flex-col items-start overflow-hidden rounded-lg border focus-visible:ring-1 focus-visible:outline-none"
      onClick={handleClick}
    >
      <p className="bg-primary text-primary-foreground flex h-6 w-full items-center justify-center text-center text-xs font-semibold">
        {formatDate(today, "MMM").toUpperCase()}
      </p>
      <p className="flex w-full items-center justify-center text-lg font-bold">
        {today.getDate()}
      </p>
    </button>
  )
}

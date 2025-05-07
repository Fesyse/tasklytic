import { CalendarProvider } from "@/calendar/contexts/calendar-context"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calendar | Dashboard",
  description: "Manage your calendar"
}

export default async function CalendarLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <CalendarProvider>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-8 py-4">
        {children}
      </div>
    </CalendarProvider>
  )
}

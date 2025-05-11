import type { CalendarPageProps } from "@/app/dashboard/(calendar)/calendar/[view]/page"
import { CalendarSkeleton } from "@/calendar/components/loading"
import { views } from "@/calendar/constants"
import { CalendarProvider } from "@/calendar/contexts/calendar-context"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Calendar | Dashboard",
  description: "Manage your calendar"
}

export default async function CalendarLayout(
  props: React.PropsWithChildren & {
    params: Promise<Partial<Awaited<CalendarPageProps["params"]>>>
  }
) {
  const params = await props.params
  let view

  if (params.view) {
    view = params.view.split("-").shift() as (typeof views)[number]
    if (!views.includes(view)) notFound()
  }

  return (
    <Suspense
      fallback={
        view ? (
          <CalendarSkeleton view={view} />
        ) : (
          <div className="flex h-32 w-full items-center justify-center">
            Loading calendar...
          </div>
        )
      }
    >
      <CalendarProvider>
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-8 py-4">
          {props.children}
        </div>
      </CalendarProvider>
    </Suspense>
  )
}

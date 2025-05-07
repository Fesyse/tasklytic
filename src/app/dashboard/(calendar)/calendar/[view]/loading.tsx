import { CalendarSkeleton } from "@/calendar/components/loading"
import { views } from "@/calendar/constants"
import { notFound } from "next/navigation"
import type { CalendarPageProps } from "./page"

export default async function CalendarLoadingPage({
  params
}: CalendarPageProps) {
  console.log(params)
  const view = (await params).view.split("-").shift() as (typeof views)[number]
  if (!views.includes(view)) notFound()

  return <CalendarSkeleton view={view} />
}

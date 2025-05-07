import { CalendarContent } from "@/calendar/components/client-container"
import { views } from "@/calendar/constants"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return views.map((view) => ({ view: `${view}-view` }))
}

export type CalendarPageProps = {
  params: Promise<{
    view: `${(typeof views)[number]}-view`
  }>
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const view = (await params).view.split("-").shift() as (typeof views)[number]
  if (!views.includes(view)) notFound()

  return <CalendarContent view={view} />
}

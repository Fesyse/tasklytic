"use client"

import { views } from "@/calendar/constants"
import { title } from "@/lib/utils"
import { usePathname } from "next/navigation"

const calendarBreadcrumbs = Object.fromEntries(
  views.map((view) => [
    `/dashboard/calendar/${view}-view`,
    `Calendar | ${title(view)} view`
  ])
)

const breadcrumbs = {
  "/dashboard": "Dashboard",
  "/dashboard/habits": "Habits",
  "/dashboard/goals": "Goals",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/profile": "Profile",
  "/dashboard/settings/notifications": "Notifications",
  "/dashboard/settings/security": "Security",
  "/dashboard/settings/privacy": "Privacy",
  ...calendarBreadcrumbs
}

export function Breadcrumbs() {
  const pathname = usePathname()

  return (
    <h1 className="text-base font-medium">
      {breadcrumbs[pathname as keyof typeof breadcrumbs]}
    </h1>
  )
}

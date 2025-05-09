"use client"

import { usePathname } from "next/navigation"

const breadcrumbs = {
  "/dashboard": "Dashboard",
  "/dashboard/habits": "Habits",
  "/dashboard/goals": "Goals",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/profile": "Profile",
  "/dashboard/settings/notifications": "Notifications",
  "/dashboard/settings/security": "Security",
  "/dashboard/settings/privacy": "Privacy"
}

export function Breadcrumbs() {
  const pathname = usePathname()

  return (
    <h1 className="text-base font-medium">
      {breadcrumbs[pathname as keyof typeof breadcrumbs]}
    </h1>
  )
}

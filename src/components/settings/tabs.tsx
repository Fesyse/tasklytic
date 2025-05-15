"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Tab = {
  value: string
  label: string
  href: string
}

const settingsTabs: Tab[] = [
  {
    value: "profile",
    label: "Profile",
    href: "/dashboard/settings"
  },
  {
    value: "security",
    label: "Security",
    href: "/dashboard/settings/security"
  }
]

interface SettingsTabsProps {
  defaultValue?: string
  orientation?: "horizontal" | "vertical"
}

export function SettingsTabs({
  defaultValue = "profile",
  orientation = "horizontal"
}: SettingsTabsProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row"
      )}
    >
      {settingsTabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === tab.href
              ? "border-border bg-background shadow-sm"
              : "bg-muted/50 hover:bg-muted border-transparent"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}

"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Link, usePathname } from "@/i18n/routing"
import { Languages } from "lucide-react"

const items = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" }
]

export default function LanguageSelector({
  className
}: Omit<ButtonProps, "asChild">) {
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            className="flex cursor-default items-center px-3 py-2 text-base"
          >
            <Link href={pathname} locale={item.value}>
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

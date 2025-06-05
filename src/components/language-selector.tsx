"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { setUserLocale } from "@/lib/server-actions/locale"
import { Languages, Loader2 } from "lucide-react"
import { useTransition } from "react"

const items = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" }
]

export default function LanguageSelector({
  className
}: Omit<ButtonProps, "asChild">) {
  const [isPending, startTransition] = useTransition()

  function onChange(locale: string) {
    startTransition(() => setUserLocale(locale))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Languages className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            className="flex cursor-default items-center px-3 py-2 text-base"
            onClick={() => onChange(item.value)}
          >
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

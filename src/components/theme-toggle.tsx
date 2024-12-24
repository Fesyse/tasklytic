"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  expanded?: boolean
  iconSize?: number
}

export function ThemeToggle({
  iconSize = 16,
  expanded = false
}: ThemeToggleProps) {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={expanded ? "default" : "icon"}
          className={cn({
            "flex h-auto w-full items-center justify-start gap-3 rounded-sm border-0 px-2 py-1.5":
              expanded
          })}
        >
          <SunIcon
            width={iconSize}
            height={iconSize}
            className={cn(
              "rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0",
              {
                "text-muted-foreground": expanded
              }
            )}
          />
          <MoonIcon
            width={iconSize}
            height={iconSize}
            className={cn(
              "absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100",
              {
                "text-muted-foreground": expanded
              }
            )}
          />
          {expanded ? "Change theme" : null}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={expanded ? "start" : "end"}
        className="w-[215px]"
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

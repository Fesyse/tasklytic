"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"

type ThemeOption = "light" | "dark" | "system"

type ModeToggleProps = {
  expanded?: boolean
  iconSize?: number
} & Omit<ButtonProps, "asChild">

export function ModeToggle({
  iconSize = 16,
  expanded = false,
  className,
  ...props
}: ModeToggleProps) {
  const { setTheme, theme } = useTheme()

  const handleThemeChange = (theme: ThemeOption) => {
    setTheme(theme)
  }

  const buttonClassName = expanded
    ? cn(
        "flex h-auto w-full items-center justify-start gap-3 rounded-sm border-0 px-2 py-1.5",
        className
      )
    : className

  const sunIconClassName = cn(
    "scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90",
    {
      "text-muted-foreground": expanded
    }
  )

  const moonIconClassName = cn(
    "absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0",
    {
      "text-muted-foreground": expanded
    }
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild {...props}>
        <Button
          variant="outline"
          size={expanded ? "default" : "icon"}
          className={buttonClassName}
          aria-label={`Change theme (current: ${theme || "system"})`}
        >
          <SunIcon
            width={iconSize}
            height={iconSize}
            className={sunIconClassName}
          />
          <MoonIcon
            width={iconSize}
            height={iconSize}
            className={moonIconClassName}
          />
          {expanded ? "Change theme" : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={expanded ? "start" : "end"}
        className="w-[215px]"
      >
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

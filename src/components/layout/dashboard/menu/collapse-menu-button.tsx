"use client"

import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu"
import { ChevronDown, Dot, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { type Submenu } from "@/lib/menu-list"
import { cn } from "@/lib/utils"

type CollapseMenuButtonProps = {
  icon: LucideIcon
  label: string
  active: boolean
  submenus: Submenu[]
  isOpen: boolean
} & ({ href: string } | { action: React.MouseEventHandler<HTMLButtonElement> })

export function CollapseMenuButton({
  icon: Icon,
  label,
  active,
  submenus,
  isOpen,
  ...rest
}: CollapseMenuButtonProps) {
  const isSubmenuActive = submenus.some(submenu => submenu.active)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive)

  const buttonContent = (
    <>
      <span className="mr-2">
        <Icon size={18} />
      </span>
      <p
        className={cn(
          "max-w-[150px] truncate",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-96 opacity-0"
        )}
      >
        {label}
      </p>
    </>
  )

  return isOpen ? (
    <Collapsible
      open={isCollapsed}
      onOpenChange={setIsCollapsed}
      className="w-full"
    >
      <Button
        variant={active ? "secondary" : "ghost"}
        className="h-10 w-full cursor-pointer justify-start"
        asChild
      >
        <div className="flex w-full items-center justify-between">
          {"href" in rest ? (
            <Link href={rest.href} className="flex items-center">
              {buttonContent}
            </Link>
          ) : (
            <Button onClick={rest.action} className="flex items-center">
              {buttonContent}
            </Button>
          )}
          <CollapsibleTrigger className="mb-1 [&[data-state=open]>div>svg]:rotate-180">
            <div
              className={cn(
                "whitespace-nowrap",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-96 opacity-0"
              )}
            >
              <ChevronDown
                size={18}
                className="transition-transform duration-200"
              />
            </div>
          </CollapsibleTrigger>
        </div>
      </Button>
      <CollapsibleContent className="mt-1 flex flex-col gap-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {submenus.map(({ label, active, ...rest }, index) => {
          const buttonContent = (
            <>
              <span className="ml-2 mr-4">
                <Dot size={18} />
              </span>
              <p
                className={cn(
                  "max-w-[170px] truncate",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0"
                )}
              >
                {label}
              </p>
            </>
          )

          return (
            <Button
              key={index}
              variant={active ? "secondary" : "ghost"}
              className={cn("mb-1 h-10 w-full justify-start", {
                "items-center justify-center p-0": !isOpen
              })}
              asChild={"href" in rest}
            >
              {"href" in rest ? (
                <Link href={rest.href}>{buttonContent}</Link>
              ) : (
                buttonContent
              )}
            </Button>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  ) : (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant={active ? "secondary" : "ghost"}
                className="mb-1 h-10 w-full items-center justify-center p-0"
              >
                <div className="flex w-full items-center justify-center">
                  <span className={cn(!isOpen ? "" : "mr-4")}>
                    <Icon size={18} />
                  </span>
                  <p
                    className={cn(
                      "max-w-[200px] truncate",
                      !isOpen ? "absolute opacity-0" : "opacity-100"
                    )}
                  >
                    {label}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" alignOffset={2}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent side="right" sideOffset={25} align="start">
        <DropdownMenuLabel className="max-w-[190px] truncate" asChild>
          {"href" in rest ? (
            <Link href={rest.href}>{label}</Link>
          ) : (
            <button onClick={rest.action}>{label}</button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {submenus.map(({ label, ...rest }, index) => (
          <DropdownMenuItem key={index} asChild={"href" in rest}>
            {"href" in rest ? (
              <Link className="cursor-pointer" href={rest.href}>
                <p className="max-w-[180px] truncate">{label}</p>
              </Link>
            ) : (
              <p className="max-w-[180px] truncate">{label}</p>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuArrow className="fill-border" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

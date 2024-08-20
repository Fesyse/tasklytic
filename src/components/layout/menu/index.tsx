"use client"

import { Ellipsis, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CollapseMenuButton } from "@/components/layout/menu/collapse-menu-button"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { getMenuList } from "@/lib/menu-list"
import { cn } from "@/lib/utils"

interface MenuProps {
  isOpen: boolean | undefined
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname()
  const menuList = getMenuList(pathname)

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {menuList.map(({ groupLabel, className, menus }, index) => (
            <li
              className={cn("w-full", className, groupLabel ? "pt-5" : "")}
              key={index}
            >
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, index) =>
                  submenus.length === 0 ? (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={active ? "secondary" : "ghost"}
                              className="w-full justify-start h-10 mb-1"
                              asChild
                            >
                              <Link href={href}>
                                <span className={cn({ "mr-4": isOpen })}>
                                  <Icon size={18} />
                                </span>
                                <p
                                  className={cn("max-w-[200px] truncate", {
                                    "-translate-x-96 opacity-0": !isOpen,
                                    "translate-x-0 opacity-100": isOpen
                                  })}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {!isOpen ? (
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          ) : null}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </li>
          ))}
          {/* <li className="w-full grow flex items-end max-w-48 mx-auto">
            <SignInMenuButton isOpen={isOpen} />
          </li> */}
        </ul>
      </nav>
    </ScrollArea>
  )
}

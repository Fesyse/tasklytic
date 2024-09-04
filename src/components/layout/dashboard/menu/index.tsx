"use client"

import { Ellipsis } from "lucide-react"
import Link from "next/link"
import { CollapseMenuButton } from "@/components/layout/dashboard/menu/collapse-menu-button"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useMenuList } from "@/lib/menu-list"
import { cn } from "@/lib/utils"
import { type Project } from "@/server/db/schema"

interface MenuProps {
  isOpen: boolean
  projects: Project[] | null
}

export function Menu({ isOpen, projects }: MenuProps) {
  const menuList = useMenuList(projects)

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex min-h-[calc(100vh-48px-36px-16px-32px)] flex-col items-start space-y-1 px-2 lg:min-h-[calc(100vh-32px-40px-32px)]">
          {menuList.map(({ groupLabel, className, menus }, index) => (
            <li
              className={cn("w-full", className, groupLabel ? "pt-5" : "")}
              key={index}
            >
              {isOpen && groupLabel ? (
                <p className="max-w-[248px] truncate px-4 pb-2 text-sm font-medium text-muted-foreground">
                  {groupLabel}
                </p>
              ) : !isOpen && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="flex w-full items-center justify-center">
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
                ({ label, icon: Icon, active, submenus, ...rest }, index) => {
                  const buttonContent = (
                    <>
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
                    </>
                  )
                  return !submenus.length ? (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={active ? "secondary" : "ghost"}
                              className="mb-1 h-10 w-full justify-start"
                              onClick={
                                "action" in rest ? rest.action : undefined
                              }
                              asChild={"href" in rest}
                            >
                              {"href" in rest ? (
                                <Link href={rest.href}>{buttonContent}</Link>
                              ) : (
                                buttonContent
                              )}
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
                        {...rest}
                      />
                    </div>
                  )
                }
              )}
            </li>
          ))}
        </ul>
      </nav>
    </ScrollArea>
  )
}

"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { Menu } from "@/components/layout/dashboard/menu"
import { useUserSettingsStore } from "@/components/providers/user-settings-store-provider"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger
} from "@/components/ui/sheet"

export function SheetMenu() {
  const navigationMenu = useUserSettingsStore(s => s.navigationMenu)

  return navigationMenu === "sidebar" ? (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col px-3 sm:w-72" side="left">
        <SheetHeader>
          <Button
            className="flex items-center justify-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/projects" className="flex items-center gap-2">
              <Icons.icon className="h-10 w-10" />
              <h1 className="text-lg font-bold">Tasklytic</h1>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  ) : (
    <Link href="/">
      <Icons.icon className="h-10 w-10" />
    </Link>
  )
}

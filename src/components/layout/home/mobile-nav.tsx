"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config"
import { navigation } from "@/lib/nav-list"

export const MobileNav = () => {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger className="md:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col gap-4">
        <SheetHeader>
          <Button variant="link" asChild>
            <Link
              href="/projects"
              className="items-center !justify-start gap-2 px-0 pb-2 pt-1"
            >
              <Icons.icon className="h-8 w-8" />
              <h1 className="text-lg font-bold">{siteConfig.title}</h1>
            </Link>
          </Button>
        </SheetHeader>
        {navigation.map(item => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "transition-color text-sm font-medium text-muted-foreground duration-200 hover:text-foreground",
              { "text-foreground": pathname.startsWith(item.href) }
            )}
          >
            {item.title}
          </Link>
        ))}
      </SheetContent>
    </Sheet>
  )
}

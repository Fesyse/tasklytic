"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigation } from "@/lib/nav-list"
import { cn } from "@/lib/utils"

export const Navigation = () => {
  const pathname = usePathname()

  return (
    <nav className="hidden gap-8 md:flex">
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
    </nav>
  )
}

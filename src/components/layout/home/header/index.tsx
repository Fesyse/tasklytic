import { UserNav } from "@/components/layout/dashboard/user-nav"
import { Navigation } from "@/components/layout/home/header/navigation"
import { MobileNav } from "@/components/layout/home/mobile-nav"
import { Icons } from "@/components/ui/icons"

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-muted font-comfortaa backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-muted/25 dark:shadow-secondary">
      <div className="mx-4 flex h-14 items-center justify-between gap-8 sm:mx-8">
        <div className="flex w-full max-w-[130px] items-center space-x-4">
          <div className="flex items-center gap-2 text-base max-md:hidden lg:text-lg">
            <Icons.icon size={36} /> <span>Tasklytic</span>
          </div>
          <MobileNav />
        </div>
        <Navigation />
        <div className="flex w-full max-w-[130px] justify-end">
          <UserNav />
        </div>
      </div>
    </header>
  )
}

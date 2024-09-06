import { SheetMenu } from "@/components/layout/dashboard/sheet-menu"
import { UserNav } from "@/components/layout/dashboard/user-nav"
import { HeaderBreadcrubms } from "./breadcrumbs"

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-muted font-comfortaa backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-muted/25 dark:shadow-secondary">
      <div className="mx-4 flex h-14 items-center sm:mx-8">
        <div className="flex items-center space-x-2">
          <SheetMenu />
          <HeaderBreadcrubms />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserNav />
        </div>
      </div>
    </header>
  )
}

import { SheetMenu } from "@/components/layout/sheet-menu"
import { UserNav } from "@/components/layout/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  title: string
  isTitleH2: boolean
}

export function Header({ title, isTitleH2 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-muted font-comfortaa backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-muted/25 dark:shadow-secondary">
      <div className="mx-4 flex h-14 items-center sm:mx-8">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          {isTitleH2 ? (
            <h2 className="header-title font-bold">{title}</h2>
          ) : (
            <h1 className="header-title font-bold">{title}</h1>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}

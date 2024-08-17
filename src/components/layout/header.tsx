import { SheetMenu } from "@/components/layout/sheet-menu"
import { UserNav } from "@/components/layout/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full dark:bg-muted/25 bg-muted border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary font-comfortaa">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}

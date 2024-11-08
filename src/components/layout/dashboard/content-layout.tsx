import { cn } from "@/lib/utils"

interface ContentLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ContentLayout({ children, className }: ContentLayoutProps) {
  return (
    <>
      <div
        className={cn(
          "relative min-h-[calc(100vh-var(--dashboard-header-size))] px-4 pb-8 pt-8 antialiased sm:px-8",
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

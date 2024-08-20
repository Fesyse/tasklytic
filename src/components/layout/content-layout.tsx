import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"

interface ContentLayoutProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function ContentLayout({
  title,
  children,
  className
}: ContentLayoutProps) {
  return (
    <>
      <Header title={title} />
      <div
        className={cn(
          "min-h-[calc(100vh-var(--header-size))] px-4 pb-8 pt-8 antialiased sm:px-8",
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

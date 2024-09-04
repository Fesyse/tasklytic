import { Header } from "@/components/layout/dashboard/header"
import { cn } from "@/lib/utils"

interface ContentLayoutProps {
  title: string
  isTitleH2?: boolean
  children: React.ReactNode
  className?: string
}

export function ContentLayout({
  title,
  children,
  className,
  isTitleH2 = false
}: ContentLayoutProps) {
  return (
    <>
      <Header title={title} isTitleH2={isTitleH2} />
      <div
        className={cn(
          "min-h-[calc(100vh-var(--dashboard-header-size))] px-4 pb-8 pt-8 antialiased sm:px-8",
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

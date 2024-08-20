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
          "pt-8 pb-8 px-4 sm:px-8 antialiased min-h-[calc(100vh-var(--header-size))]",
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

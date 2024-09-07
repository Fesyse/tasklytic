import type { FC, PropsWithChildren } from "react"
import { Header } from "@/components/layout/home/header"

export const HomeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />
      <div className="container [&>div]:min-h-[calc(100vh-var(--dashboard-header-size))]">
        {children}
      </div>
    </>
  )
}

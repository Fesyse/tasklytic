import type { FC, PropsWithChildren } from "react"

export const HomeLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div className="[&>div]:min-h-[calc(100vh)]">{children}</div>
}

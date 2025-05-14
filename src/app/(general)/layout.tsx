import React from "react"

export default function GeneralLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="container mx-auto flex max-w-[900px] flex-col items-center justify-center py-20">
      {children}
    </div>
  )
}

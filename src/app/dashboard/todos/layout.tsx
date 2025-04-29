import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Todos | Dashboard",
  description: "Manage your todos and tasks"
}

export default function TodosLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

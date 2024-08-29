import { ContentLayout } from "@/components/layout/content-layout"

export default function DashboardLayout({ children }: React.PropsWithChildren) {
  return (
    <ContentLayout
      title="Dashboard"
      className="grid grid-cols-[12rem_1fr] gap-4"
    >
      {children}
    </ContentLayout>
  )
}

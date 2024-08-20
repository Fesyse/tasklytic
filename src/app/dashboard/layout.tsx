import { ContentLayout } from "@/components/layout/content-layout"

export default function DashboardLayout({ children }: React.PropsWithChildren) {
  return <ContentLayout title="Dashboard">{children}</ContentLayout>
}

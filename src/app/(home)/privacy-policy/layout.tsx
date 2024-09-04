import { ContentLayout } from "@/components/layout/dashboard/content-layout"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <ContentLayout title="Privacy Policy" isTitleH2 className="container">
      {children}
    </ContentLayout>
  )
}

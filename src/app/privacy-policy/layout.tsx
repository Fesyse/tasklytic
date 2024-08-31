import { ContentLayout } from "@/components/layout/content-layout"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <ContentLayout title="Privacy Policy" isTitleH2>
      {children}
    </ContentLayout>
  )
}

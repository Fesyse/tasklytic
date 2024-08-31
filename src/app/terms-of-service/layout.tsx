import { ContentLayout } from "@/components/layout/content-layout"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <ContentLayout title="Terms of Service" isTitleH2 className="container">
      {children}
    </ContentLayout>
  )
}

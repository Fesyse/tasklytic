import { ContentLayout } from "@/components/layout/dashboard/content-layout"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <ContentLayout
      title="Create Project"
      className="flex items-center justify-center"
    >
      {children}
    </ContentLayout>
  )
}

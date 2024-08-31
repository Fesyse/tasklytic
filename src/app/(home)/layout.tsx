import { ContentLayout } from "@/components/layout/content-layout"

export default function HomeLayout({ children }: React.PropsWithChildren) {
  return (
    <ContentLayout title="Home" className="!p-0" isTitleH2>
      {children}
    </ContentLayout>
  )
}

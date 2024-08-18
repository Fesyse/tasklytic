import { ContentLayout } from "@/components/layout/content-layout"

export default function HomeLayout({ children }: React.PropsWithChildren) {
  return <ContentLayout title="Home">{children}</ContentLayout>
}

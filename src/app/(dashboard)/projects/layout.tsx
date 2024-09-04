import { ContentLayout } from "@/components/layout/dashboard/content-layout"

export default function ProjectsLayout({ children }: React.PropsWithChildren) {
  return <ContentLayout title="Projects">{children}</ContentLayout>
}

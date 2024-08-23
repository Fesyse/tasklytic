import { ContentLayout } from "@/components/layout/content-layout"

export default function SettingsLayout({ children }: React.PropsWithChildren) {
  return <ContentLayout title="Settings">{children}</ContentLayout>
}

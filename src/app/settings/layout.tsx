import { ContentLayout } from "@/components/layout/content-layout"

export default function SettingsLayout({ children }: React.PropsWithChildren) {
  return (
    <ContentLayout
      title="Settings"
      className="flex items-center justify-center"
    >
      {children}
    </ContentLayout>
  )
}

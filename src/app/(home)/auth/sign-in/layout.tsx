import { ContentLayout } from "@/components/layout/dashboard/content-layout"

export default function SignInLayout({ children }: React.PropsWithChildren) {
  return (
    <ContentLayout
      title="Sign in"
      className="h-[calc(100vh-var(--dashboard-header-size))] max-w-full overflow-hidden !p-0 lg:grid lg:grid-cols-2"
    >
      {children}
    </ContentLayout>
  )
}

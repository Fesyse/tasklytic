import { ContentLayout } from "@/components/layout/content-layout"

export default function SignInLayout({ children }: React.PropsWithChildren) {
  return (
    <ContentLayout
      title="Sign in"
      className="!p-0 lg:grid lg:grid-cols-2 max-w-full h-[calc(100vh-57px)] overflow-hidden"
    >
      {children}
    </ContentLayout>
  )
}

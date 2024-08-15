import { ContentLayout } from "@/components/layout/content-layout"

export default async function HomePage() {
  return (
    <ContentLayout title="Home">
      <div className="container flex flex-col items-center">
        <h1>Tasklytic</h1>
      </div>
    </ContentLayout>
  )
}

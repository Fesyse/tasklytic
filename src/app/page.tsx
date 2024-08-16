import { ContentLayout } from "@/components/layout/content-layout"
import { BackgroundBeams } from "@/components/ui/background-beams"

export default async function HomePage() {
  return (
    <>
      <ContentLayout title="Home">
        <h1 className="text-6xl ">Tasklytic</h1>
      </ContentLayout>
    </>
  )
}

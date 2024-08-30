import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type DashboardPageProps = {
  searchParams: {
    page?: string
    perPage?: string
  }
}

export default async function DashboardPage({
  searchParams
}: DashboardPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const perPage = searchParams.perPage ? parseInt(searchParams.perPage) : 10

  return (
    <>
      {/* <ScrollArea>
        <nav className="h-full">
          <ul className="flex flex-col items-stretch gap-4 [&>li>a]:w-full [&>li>button]:w-full">
            <li><CreateProjectModal /> </li>
            <li>
              <Separator />
            </li>
            <Suspense fallback={<ProjectNavigationLoading />}>
              <ProjectNavigation />
            </Suspense>
          </ul>
        </nav>
      </ScrollArea>
      */}
      <div>123</div>
    </>
  )
}

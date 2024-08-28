import Link from "next/link"
import { CreateProjectModal } from "@/components/project/create-project-modal"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type Project } from "@/server/db/schema"
import { api } from "@/trpc/server"

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

  const projects = await api.project.getAll()
  // mock projects
  // const projects: Project[] = [
  //   {
  //     id: "123",
  //     name: "Fycode",
  //     userId: "75b39e8c-e26c-4d4c-9917-27860579db5b",
  //     createdAt: new Date(),
  //     updatedAt: new Date()
  //   }
  // ]

  return (
    <div className="grid grid-cols-[12rem_1fr] gap-4">
      <ScrollArea>
        <nav className="h-full">
          <ul className="flex flex-col items-stretch gap-2 [&>li>a]:w-full [&>li>button]:w-full">
            <li>
              <CreateProjectModal />
            </li>
            {/* FIXME: guest user cant access projects from localstorage | FIX USING CLIENT */}
            {projects?.length ? (
              projects.map(project => (
                <li>
                  <Button variant="outline" asChild>
                    <Link href={`/project/${project.id}/`}>{project.name}</Link>
                  </Button>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">
                There's no projects yet.
              </li>
            )}
          </ul>
        </nav>
      </ScrollArea>
      <div>123</div>
    </div>
  )
}

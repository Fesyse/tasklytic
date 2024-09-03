import Balancer from "react-wrap-balancer"
import { Projects } from "@/components/projects"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { api } from "@/trpc/server"

type ProjectsPageProps = {
  searchParams: {
    page?: string
    perPage?: string
  }
}

export default async function ProjectsPage(
  {
    // searchParams
  }: ProjectsPageProps
) {
  // const page = searchParams.page ? parseInt(searchParams.page) : 1
  // const perPage = searchParams.perPage ? parseInt(searchParams.perPage) : 10
  const projects = await api.project.getAll()

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center justify-center">
        <h2 className="bg-gradient-to-b from-foreground/25 to-foreground bg-clip-text text-center text-4xl font-bold text-transparent dark:from-neutral-200 dark:to-neutral-600 lg:text-5xl">
          All your projects
        </h2>
        <Balancer>
          <TextGenerateEffect
            words="Organize, delete, see and manipulate with all your current projects
          you are working on."
            duration={0.5}
            className="w-full max-w-96 text-center !text-base md:!text-lg"
          />
        </Balancer>
      </section>
      <Projects projects={projects} />
    </div>
  )
}

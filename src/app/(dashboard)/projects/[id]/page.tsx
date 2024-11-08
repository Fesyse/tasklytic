type ProjectsProps = { params: Promise<{ id: string }> }

export default async function ProjectPage(_props: ProjectsProps) {
  // const project = await api.projects.getById({
  //   id,
  //   with: {
  //     notes: true
  //   }
  // })

  // if (!project) redirect("/not_found")

  // return <Project project={project} />
  return <div></div>
}

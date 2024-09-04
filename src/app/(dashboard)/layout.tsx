import { DashboardLayout as Layout } from "@/components/layout/dashboard"
import { api } from "@/trpc/server"

export default async function DashboardLayout({
  children
}: React.PropsWithChildren) {
  const projects = await api.project.getAll()
  return <Layout projects={projects}>{children}</Layout>
}

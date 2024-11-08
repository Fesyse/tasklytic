import { DashboardLayout as Layout } from "@/components/layout/dashboard"

export default async function DashboardLayout({
  children
}: React.PropsWithChildren) {
  return <Layout>{children}</Layout>
}

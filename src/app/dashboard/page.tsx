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

  const result = await api.task.getTasks({ page, perPage })

  return <div>asd</div>
}

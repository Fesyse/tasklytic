import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  return (
    <div className="grid grid-cols-[12rem_1fr]">
      <nav className="h-full">
        <ul className="flex flex-col items-center gap-2">
          <Button className="group/modal-btn relative overflow-hidden">
            <span className="text-center transition duration-500 group-hover/modal-btn:translate-x-40">
              Create new project
            </span>
            <div className="absolute inset-0 z-20 flex -translate-x-40 items-center justify-center transition duration-500 group-hover/modal-btn:translate-x-0">
              <Plus />
            </div>
          </Button>
        </ul>
      </nav>
      <div>123</div>
    </div>
  )
}

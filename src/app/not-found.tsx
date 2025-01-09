import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { HomeLayout } from "@/components/layout/home"

export default function NotFoundPage() {
  return (
    <HomeLayout className="flex max-w-full flex-col items-center justify-center overflow-hidden bg-background !py-0 px-4">
      <div className="flex max-w-md flex-col items-center justify-center text-center">
        <div className="mb-8 flex items-center justify-center rounded-lg border">
          <Icons.placeholder className="aspect-square w-52 sm:w-[300px]" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          404
        </h1>
        <p className="mt-4 text-muted-foreground">
          Oops, the page you are looking for does not exist.
        </p>
        <div className="mt-6">
          <Link
            href="/projects"
            className={buttonVariants({
              size: "default",
              variant: "default"
            })}
            prefetch
          >
            Go to Projects
          </Link>
        </div>
      </div>
    </HomeLayout>
  )
}

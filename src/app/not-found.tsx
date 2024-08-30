import Image from "next/image"
import Link from "next/link"
import { ContentLayout } from "@/components/layout/content-layout"
import { buttonVariants } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <ContentLayout
      title="Not found"
      className="flex h-[calc(100vh-var(--header-size))] max-w-full flex-col items-center justify-center overflow-hidden bg-background !py-0 px-4"
    >
      <div className="flex h-[calc(100vh-var(--header-size))] flex-col items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <div className="mb-8 flex items-center justify-center rounded-lg border">
            <Image
              src="/placeholder.svg"
              alt="404 Error"
              width={300}
              height={300}
              className="aspect-square w-52 sm:w-[300px]"
            />
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
              prefetch={false}
            >
              Go to Projects
            </Link>
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}

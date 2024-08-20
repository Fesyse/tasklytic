import Image from "next/image"
import Link from "next/link"
import { ContentLayout } from "@/components/layout/content-layout"
import { buttonVariants } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <ContentLayout
      title="Not found"
      className="!p-0 max-w-full overflow-hidden flex h-[calc(100vh-var(--header-size))] flex-col items-center justify-center bg-background"
    >
      <div className="flex h-[calc(100vh-var(--header-size))] flex-col items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center border rounded-lg mb-8">
            <Image
              src="/placeholder.svg"
              alt="404 Error"
              width={300}
              height={300}
              className="aspect-square"
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
              href="/dashboard"
              className={buttonVariants({
                size: "default",
                variant: "default"
              })}
              prefetch={false}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}

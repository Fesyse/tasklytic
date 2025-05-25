import { Skeleton } from "@/components/ui/skeleton"

export const NoteSkeleton = () => {
  return (
    <div className="mx-auto max-w-[44rem] pt-40">
      {/* Note content header skeleton */}
      <div className="mb-12 flex items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-12 w-1/3" />
      </div>
      {/* Editor content skeleton */}
      <div className="space-y-3">
        {/* Text blocks */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />

        {/* Table block */}
        <div className="my-8">
          <Skeleton className="h-10 w-full rounded-t-lg" /> {/* Table header */}
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full rounded-b-lg" />
        </div>

        {/* Analytics/Chart block */}
        <div className="my-8">
          <Skeleton className="mb-4 h-8 w-1/4" /> {/* Chart title */}
          <Skeleton className="h-64 w-full rounded-lg" /> {/* Chart area */}
        </div>

        {/* More text blocks */}
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-6 w-3/4" />

        {/* Image/Media block */}
        <Skeleton className="my-4 h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function TodosLoading() {
  return (
    <div className="flex flex-col gap-4 [--height:calc(var(--spacing)*17)]">
      <Skeleton className="h-[var(--height)] w-full" />
      <Skeleton className="h-[var(--height)] w-full" />
      <Skeleton className="h-[var(--height)] w-full" />
      <Skeleton className="h-[var(--height)] w-full" />
      <Skeleton className="h-[var(--height)] w-full" />
      <Skeleton className="h-[var(--height)] w-full" />
      <Skeleton className="h-[var(--height)] w-full" />
    </div>
  )
}

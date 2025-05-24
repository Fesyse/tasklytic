import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const skeletonVariants = cva("bg-accent animate-pulse rounded-md", {
  variants: {
    variant: {
      default: "",
      destructive: "bg-red-500/50"
    }
  }
})

type SkeletonProps = React.ComponentProps<"div"> &
  VariantProps<typeof skeletonVariants>

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Skeleton }

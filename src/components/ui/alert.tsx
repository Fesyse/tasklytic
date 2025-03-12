import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type AlertProps = {
  children: string
  iconClassName?: string
} & React.HTMLAttributes<HTMLDivElement>

export const Alert: React.FC<AlertProps> = ({
  children,
  className,
  iconClassName,
  ...props
}) => {
  return (
    <div
      className={cn(
        "mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
        className
      )}
      {...props}
    >
      <AlertCircle className={cn("size-5", iconClassName)} />
      <p className="text-sm">{children}</p>
    </div>
  )
}

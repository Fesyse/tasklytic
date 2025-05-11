import { cn } from "@/lib/utils"

type AuthHeaderProps = React.ComponentProps<"button"> & {
  title: string
  description?: string
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  description,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    >
      <h1 className="text-2xl font-bold">{title}</h1>
      {description ? (
        <p className="text-muted-foreground text-sm text-balance">
          {description}
        </p>
      ) : null}
    </div>
  )
}

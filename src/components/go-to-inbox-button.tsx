import { Button, type ButtonProps } from "@/components/ui/button"
import Link from "next/link"

type GoToInboxButtonProps = Omit<ButtonProps, "asChild"> & {
  email: string
}

export const GoToInboxButton = ({ email, ...props }: GoToInboxButtonProps) => {
  return (
    <Button asChild {...props}>
      <Link href={`mailto:${email}`}>Go to inbox</Link>
    </Button>
  )
}

import { Button, type ButtonProps } from "@/components/ui/button"

type GoToInboxButtonProps = Omit<ButtonProps, "asChild"> & {
  email: string
}

const mailServices: Record<string, string> = {
  "gmail.com": "https://mail.google.com",
  "yahoo.com": "https://mail.yahoo.com",
  "hotmail.com": "https://mail.live.com",
  "outlook.com": "https://outlook.com",
  "icloud.com": "https://mail.apple.com",
  "zoho.com": "https://mail.zoho.com",
  "mail.ru": "https://mail.ru"
}

export const GoToInboxButton = ({ email, ...props }: GoToInboxButtonProps) => {
  const mailService = mailServices[email.split("@")[1]!]

  return (
    <Button asChild {...props}>
      <a href={mailService}>Go to inbox</a>
    </Button>
  )
}

import { siteConfig } from "@/lib/site-config"
import { Link, Text } from "@react-email/components"

export function Support() {
  return (
    <Text className="text-muted-foreground text-center text-xs">
      This is an automated message, please do not reply to this email. If you
      need help, please contact{" "}
      <Link
        href={`mailto:${siteConfig.emails.support}`}
        className="text-primary"
      >
        {siteConfig.emails.support}
      </Link>
    </Text>
  )
}

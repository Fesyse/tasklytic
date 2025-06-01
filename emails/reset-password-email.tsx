import { Icons } from "@/components/ui/icons"
import { tailwindConfig } from "@/styles/tailwind.config"
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text
} from "@react-email/components"
import { Support } from "./components/support"

type ResetPasswordEmailProps = {
  url?: string
  userName?: string
}

export default function ResetPasswordEmail({
  url = "https://tasklytic.fesyse.site",
  userName = "User"
}: ResetPasswordEmailProps) {
  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head />
        <Preview>Reset your password - Tasklytic</Preview>
        <Body className="bg-background mx-auto my-0 font-sans">
          <Container className="bg-card bg-noise mx-auto my-10 max-w-md rounded-xl border border-solid border-[#eaeaea] p-8">
            <div className="flex flex-col items-center justify-center">
              <Icons.icon className="size-12" />
              <Heading className="text-foreground mb-6 text-center text-2xl font-bold">
                Reset your password
              </Heading>
            </div>

            <Text className="text-muted-foreground mb-6 text-base">
              Hi {userName},
            </Text>

            <Text className="text-muted-foreground mb-4 text-base">
              Please click the link below to reset your password:
            </Text>

            <Section className="mb-6 text-center">
              <Link
                href={url}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex rounded-md px-4 py-3 text-center text-sm shadow-xs"
              >
                Click here to reset your password
              </Link>
            </Section>

            <Section className="mb-6 text-center text-sm">
              <Text className="text-muted-foreground mb-0">
                This link will expire in 15 minutes.
              </Text>
              <Text className="text-muted-foreground mt-2">
                If you didn't request this password reset, you can safely ignore
                this email. Your account is secure.
              </Text>
            </Section>

            <Hr className="my-6 border border-solid border-[#eaeaea]" />

            <Support />
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

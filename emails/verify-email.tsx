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

type VerifyEmailProps = {
  url?: string
  userName?: string
}

export default function VerifyEmail({
  url = "https://tasklytic.fesyse.site",
  userName = "User"
}: VerifyEmailProps) {
  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head />
        <Preview>Verify your email | Sign Up - Tasklytic</Preview>
        <Body className="bg-background mx-auto my-0 font-sans">
          <Container className="bg-noise bg-card mx-auto my-10 max-w-md rounded-xl border border-solid border-[#eaeaea] p-8">
            <div className="flex flex-col items-center justify-center">
              <Icons.icon className="size-12" />
              <Heading className="text-foreground mb-6 text-center text-2xl font-bold">
                Sign Up - Verify your email
              </Heading>
            </div>
            <Text className="text-muted-foreground mb-6 text-base">
              Hi {userName},
            </Text>

            <Text className="text-muted-foreground mb-4 text-base">
              Please click the link below to verify your email:
            </Text>

            <Section className="mb-6 text-center">
              <Link
                href={url}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex rounded-md px-4 py-3 text-center text-sm shadow-xs"
              >
                Click here to verify your email
              </Link>
            </Section>

            <Section className="mb-6 text-center text-sm">
              <Text className="text-muted-foreground mb-0">
                This link will expire in 15 minutes.
              </Text>
              <Text className="text-muted-foreground mt-2">
                If you didn't request this code, you can safely ignore this
                email.
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

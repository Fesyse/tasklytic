import { tailwindConfig } from "@/styles/tailwind.config"
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text
} from "@react-email/components"
import { Support } from "./components/support"

type OTPEmailProps = {
  otp?: string
  userName?: string
  expiryMinutes?: number
}

export default function OTPEmail({
  otp = "123456",
  userName = "User",
  expiryMinutes = 15
}: OTPEmailProps) {
  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head />
        <Preview>Your verification code</Preview>
        <Body className="bg-background mx-auto my-0 font-sans">
          <Container className="bg-card mx-auto my-10 max-w-md rounded-xl border border-solid border-[#eaeaea] p-8">
            <Heading className="text-foreground mb-6 text-center text-2xl font-bold">
              Verification Code
            </Heading>

            <Text className="text-muted-foreground mb-6 text-base">
              Hi {userName},
            </Text>

            <Text className="text-muted-foreground mb-4 text-base">
              Please use the verification code below to complete your action:
            </Text>

            <Section className="mb-6 text-center">
              <div className="bg-secondary mx-auto rounded-lg px-2 py-6 text-center">
                <Text className="text-primary m-0 font-mono text-3xl font-bold tracking-widest">
                  {otp}
                </Text>
              </div>
            </Section>

            <Text className="text-muted-foreground mb-6 text-sm">
              This code will expire in {expiryMinutes} minutes. If you didn't
              request this code, you can safely ignore this email.
            </Text>

            <Hr className="my-6 border border-solid border-[#eaeaea]" />

            <Support />
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

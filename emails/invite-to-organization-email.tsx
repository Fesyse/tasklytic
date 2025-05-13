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

type InviteToOrganizationEmailProps = {
  url?: string
  organizationName?: string
  inviterName?: string
  recipientName?: string
  inviteExpiryDays?: number
}

export default function InviteToOrganizationEmail({
  url = "https://tasklytic.fesyse.site/accept-invite",
  organizationName = "Organization",
  inviterName = "Team Member",
  recipientName = "there",
  inviteExpiryDays = 7
}: InviteToOrganizationEmailProps) {
  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head />
        <Preview>
          You've been invited to join {organizationName} on Tasklytic
        </Preview>
        <Body className="bg-background mx-auto my-0 font-sans">
          <Container className="bg-card mx-auto my-10 max-w-md rounded-xl border border-solid border-[#eaeaea] p-8">
            <Heading className="text-foreground mb-6 text-center text-2xl font-bold">
              You've been invited to join {organizationName}
            </Heading>

            <Text className="text-muted-foreground mb-6 text-base">
              Hi {recipientName},
            </Text>

            <Text className="text-muted-foreground mb-4 text-base">
              {inviterName} has invited you to join their organization "
              {organizationName}" on Tasklytic.
            </Text>

            <Section className="mb-6 text-center">
              <Link
                href={url}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex rounded-md px-4 py-3 text-center text-sm font-medium shadow-xs"
              >
                Accept Invitation
              </Link>
            </Section>

            <Section className="mb-6 text-sm">
              <Text className="text-muted-foreground mb-0">
                This invitation will expire in {inviteExpiryDays} days.
              </Text>
              <Text className="text-muted-foreground mt-2">
                If you weren't expecting this invitation, you can safely ignore
                this email.
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

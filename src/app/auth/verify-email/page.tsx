import { GoToInboxButton } from "@/components/go-to-inbox-button"
import { notFound } from "next/navigation"

type VerifyEmailProps = {
  searchParams: Promise<{
    email: string
  }>
}

export default async function VerifyEmail({ searchParams }: VerifyEmailProps) {
  const { email } = await searchParams

  if (!email) {
    notFound()
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-muted-foreground text-center text-sm">
          We've sent a verification link to your email address. Please click the
          link to verify your account.
        </p>

        <GoToInboxButton variant="outline" className="mt-3" email={email} />
      </div>
    </div>
  )
}

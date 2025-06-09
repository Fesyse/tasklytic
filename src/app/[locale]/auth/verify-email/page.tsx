import { GoToInboxButton } from "@/components/go-to-inbox-button"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

type VerifyEmailProps = {
  searchParams: Promise<{
    email: string
  }>
}

export default async function VerifyEmail({ searchParams }: VerifyEmailProps) {
  const { email } = await searchParams

  if (!email) notFound()

  const t = await getTranslations("Auth.VerifyEmail")

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{t("checkEmailTitle")}</h1>
        <p className="text-muted-foreground text-center text-sm">
          {t("verificationLinkDescription")}
        </p>

        <GoToInboxButton variant="outline" className="mt-3" email={email} />
      </div>
    </div>
  )
}

import { AuthHeader } from "@/components/auth/auth-header"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { getTranslations } from "next-intl/server"

export default async function ForgotPasswordPage() {
  const t = await getTranslations("Auth.ForgotPassword")
  return (
    <>
      <AuthHeader title={t("title")} description={t("description")} />
      <ForgotPasswordForm />
    </>
  )
}

import { AuthHeader } from "@/components/auth/auth-header"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { useTranslations } from "next-intl"

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth.ForgotPassword")
  return (
    <>
      <AuthHeader title={t("title")} description={t("description")} />
      <ForgotPasswordForm />
    </>
  )
}

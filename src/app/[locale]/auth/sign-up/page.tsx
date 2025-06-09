import { AuthForm } from "@/components/auth/auth-form"
import { AuthHeader } from "@/components/auth/auth-header"
import { useTranslations } from "next-intl"

export default function SignUpPage() {
  const t = useTranslations("Auth.SignUp")
  return (
    <>
      <AuthHeader title={t("title")} description={t("description")} />
      <AuthForm type="sign-up" />
    </>
  )
}

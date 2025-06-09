import { AuthForm } from "@/components/auth/auth-form"
import { AuthHeader } from "@/components/auth/auth-header"
import { useTranslations } from "next-intl"

export default function SignInPage() {
  const t = useTranslations("Auth.SignIn")
  return (
    <>
      <AuthHeader title={t("title")} description={t("description")} />
      <AuthForm type="sign-in" />
    </>
  )
}

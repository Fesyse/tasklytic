import { AuthForm } from "@/components/auth/auth-form"
import { AuthHeader } from "@/components/auth/auth-header"
import { getTranslations } from "next-intl/server"

export default async function SignUpPage() {
  const t = await getTranslations("Auth.SignUp")
  return (
    <>
      <AuthHeader title={t("title")} description={t("description")} />
      <AuthForm type="sign-up" />
    </>
  )
}

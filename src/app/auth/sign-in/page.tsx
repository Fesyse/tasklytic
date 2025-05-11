import { AuthForm } from "@/components/auth/auth-form"
import { AuthHeader } from "@/components/auth/auth-header"

export default async function SignInPage() {
  return (
    <>
      <AuthHeader
        title="Sign in"
        description="Enter your email below to sign in to your account"
      />
      <AuthForm type="sign-in" />
    </>
  )
}

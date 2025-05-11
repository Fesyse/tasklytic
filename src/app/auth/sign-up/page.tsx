import { AuthForm } from "@/components/auth/auth-form"
import { AuthHeader } from "@/components/auth/auth-header"

export default async function SignUpPage() {
  return (
    <>
      <AuthHeader
        title="Sign up"
        description="Enter your email below to create new account"
      />
      <AuthForm type="sign-up" />
    </>
  )
}

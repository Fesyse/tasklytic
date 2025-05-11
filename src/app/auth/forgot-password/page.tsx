import { AuthHeader } from "@/components/auth/auth-header"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        title="Forgot password"
        description="Please fill out form below to recover your account"
      />
      <ForgotPasswordForm />
    </>
  )
}

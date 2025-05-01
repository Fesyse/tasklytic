import { AuthForm } from "@/components/auth-form"

export default async function SignUpPage() {
  return (
    <>
      <div className="mb-4 flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign up</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to create new account
        </p>
      </div>
      <AuthForm type="sign-up" />
    </>
  )
}

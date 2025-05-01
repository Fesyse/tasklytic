import { SignInForm } from "@/components/sign-in-form"

export default async function SignInPage() {
  return (
    <>
      <div className="mb-4 flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to sign in to your account
        </p>
      </div>
      <SignInForm type="sign-in" />
    </>
  )
}

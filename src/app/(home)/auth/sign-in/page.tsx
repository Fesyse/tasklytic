import { Suspense } from "react"
import { Icons } from "@/components/ui/icons"
import { SignIn } from "@/components/blocks/sign-in"

export default function SignInPage() {
  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Suspense fallback={<div></div>}>
          <SignIn />
        </Suspense>
      </div>
      <div className="hidden bg-muted lg:block">
        <Icons.placeholder className="aspect-square h-full w-full object-cover dark:brightness-[0.375]" />
      </div>
    </>
  )
}

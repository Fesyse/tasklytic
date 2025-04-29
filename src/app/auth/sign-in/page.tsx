import { CalendarCheck } from "lucide-react"

import { SignInForm } from "@/components/sign-in-form"
import Link from "next/link"

export default async function SignInPage() {
  return (
    <div className="bg-noise grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <CalendarCheck />
            Froo
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignInForm type="sign-in" />
          </div>
        </div>
      </div>
      <div className="bg-muted bg-noise relative hidden lg:block"></div>
    </div>
  )
}

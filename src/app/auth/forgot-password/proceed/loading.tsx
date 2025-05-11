import { AuthHeader } from "@/components/auth/auth-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordProceedLoading() {
  return (
    <>
      <AuthHeader
        title="Reset your password"
        description="Loading your reset request..."
      />
      <div className="mt-6 flex flex-col items-center justify-center space-y-4">
        <div className="flex h-12 w-full items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
        <div className="w-full space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-full" />
        </div>
      </div>
    </>
  )
}

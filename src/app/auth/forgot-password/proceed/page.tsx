"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AuthHeader } from "@/components/auth/auth-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { PasswordInput } from "@/components/ui/password-input"
import { env } from "@/env"
import { authClient } from "@/lib/auth-client"
import { verifyTurnstileToken } from "@/lib/turnstile"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Turnstile } from "next-turnstile"
import { toast } from "sonner"

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, {
      message: "Password must be at least 8 characters long"
    }),
    confirmPassword: z.string().min(8),
    turnstileToken: z.string({
      message: "You need to verify that you are human, click checkbox above"
    })
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

function ForgotPasswordProceedPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const token = searchParams.get("token")

  const [turnstileStatus, setTurnstileStatus] = useState<
    "success" | "error" | "expired" | "required"
  >("required")
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  })

  const handleNoTokenError = () => {
    setStatus("error")
    setErrorMessage(
      "Reset token is missing. Please try the password reset process again."
    )
  }

  useEffect(() => {
    if (!token) {
      handleNoTokenError()
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      handleNoTokenError()
      return
    }

    setStatus("loading")

    if (turnstileStatus !== "success") {
      setErrorMessage("Please verify you are not a robot")
      setStatus("error")
      return
    }

    const success = await verifyTurnstileToken(data.turnstileToken)

    if (!success) {
      toast.error("Seems like you are bot, try again later.")
      setStatus("error")
      return
    }
    try {
      const result = await authClient.resetPassword({
        newPassword: data.newPassword,
        token
      })

      if (result.error) {
        setStatus("error")
        setErrorMessage(
          result.error.message || "Failed to reset password. Please try again."
        )
        return
      }

      setStatus("success")

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/auth/sign-in")
      }, 3500)
    } catch (error) {
      setStatus("error")
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      )
    }
  }

  if (status === "success") {
    return (
      <>
        <AuthHeader
          title="Password Reset Successful"
          description="Your password has been reset successfully."
        />
        <Alert
          variant="default"
          className="mt-6 border-green-200 bg-green-50 text-green-800"
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your password has been reset. You will be redirected to the sign-in
            page shortly.
          </AlertDescription>
        </Alert>
        <Button
          className="mt-6 w-full"
          onClick={() => router.push("/auth/sign-in")}
        >
          Go to Sign In
        </Button>
      </>
    )
  }

  if (status === "error" && !token) {
    return (
      <>
        <AuthHeader
          title="Invalid Password Reset"
          description="We couldn't process your password reset request."
        />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Button
          className="mt-6 w-full"
          onClick={() => router.push("/auth/forgot-password")}
        >
          Try Again
        </Button>
      </>
    )
  }

  return (
    <>
      <AuthHeader
        title="Reset your password"
        description="Enter your new password below"
      />
      {status === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <PasswordInput
                      placeholder="Enter your new password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <PasswordInput
                      placeholder="Confirm your new password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <Turnstile
                  sandbox={
                    window.location.host.includes("localhost")
                      ? "pass"
                      : undefined
                  }
                  siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  retry="auto"
                  refreshExpired="auto"
                  onError={() => {
                    setTurnstileStatus("error")
                    setErrorMessage("Security check failed. Please try again.")
                  }}
                  onExpire={() => {
                    setTurnstileStatus("expired")
                    setErrorMessage(
                      "Security check expired. Please verify again."
                    )
                  }}
                  onLoad={() => {
                    setTurnstileStatus("required")
                    setErrorMessage("")
                  }}
                  onVerify={(token) => {
                    field.onChange(token)
                    setTurnstileStatus("success")
                    setErrorMessage("")
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}

function PasswordResetSkeleton() {
  return (
    <>
      <div className="space-y-2">
        <div className="bg-muted h-8 w-2/3 animate-pulse rounded-md"></div>
        <div className="bg-muted h-4 w-full animate-pulse rounded-md opacity-70"></div>
      </div>
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <div className="bg-muted h-5 w-1/4 animate-pulse rounded-md"></div>
          <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="bg-muted h-5 w-1/3 animate-pulse rounded-md"></div>
          <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
        </div>
        <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
      </div>
    </>
  )
}

export default function ForgotPasswordProceedPage() {
  return (
    <Suspense fallback={<PasswordResetSkeleton />}>
      <ForgotPasswordProceedPageContent />
    </Suspense>
  )
}

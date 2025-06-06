"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AuthHeader } from "@/components/auth/auth-header"
import { Turnstile } from "@/components/turnstile"
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
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { verifyTurnstileToken } from "@/lib/turnstile"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
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

  const t = useTranslations("Auth.ForgotPasswordProceed")

  const handleNoTokenError = () => {
    setStatus("error")
    setErrorMessage(t("resetTokenMissingError"))
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
      setErrorMessage(t("notRobotError"))
      setStatus("error")
      return
    }

    const success = await verifyTurnstileToken(data.turnstileToken)

    if (!success) {
      toast.error(t("botDetectedError"))
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
        setErrorMessage(result.error.message || t("resetPasswordFailedError"))
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
        error instanceof Error ? error.message : t("unexpectedError")
      )
    }
  }

  if (status === "success") {
    return (
      <>
        <AuthHeader
          title={t("successTitle")}
          description={t("successDescription")}
        />
        <Alert
          variant="default"
          className="mt-6 border-green-200 bg-green-50 text-green-800"
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle>{t("successShortTitle")}</AlertTitle>
          <AlertDescription>{t("successRedirectMessage")}</AlertDescription>
        </Alert>
        <Button
          className="mt-6 w-full"
          onClick={() => router.push("/auth/sign-in")}
        >
          {t("goToSignInButton")}
        </Button>
      </>
    )
  }

  if (status === "error" && !token) {
    return (
      <>
        <AuthHeader
          title={t("invalidResetTitle")}
          description={t("invalidResetDescription")}
        />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>{t("errorAlertTitle")}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Button
          className="mt-6 w-full"
          onClick={() => router.push("/auth/forgot-password")}
        >
          {t("tryAgainButton")}
        </Button>
      </>
    )
  }

  return (
    <>
      <AuthHeader
        title={t("resetPasswordTitle")}
        description={t("resetPasswordDescription")}
      />
      {status === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>{t("errorAlertTitle")}</AlertTitle>
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
                <FormLabel>{t("newPasswordLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <PasswordInput
                      placeholder={t("newPasswordPlaceholder")}
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
                <FormLabel>{t("confirmPasswordLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <PasswordInput
                      placeholder={t("confirmPasswordPlaceholder")}
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
            name="turnstileToken"
            render={({ field }) => (
              <FormItem className="flex justify-center">
                <Turnstile
                  onError={() => {
                    setTurnstileStatus("error")
                    setErrorMessage(t("turnstileError"))
                  }}
                  onExpire={() => {
                    setTurnstileStatus("expired")
                    setErrorMessage(t("turnstileExpired"))
                  }}
                  onLoad={() => {
                    setTurnstileStatus("required")
                    setErrorMessage("")
                  }}
                  onVerify={(token) => {
                    field.onChange(token)
                    setTurnstileStatus("success")
                  }}
                />
                <FormMessage>
                  {turnstileStatus === "error" || turnstileStatus === "expired"
                    ? errorMessage
                    : null}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {t("resetPasswordTitle")}
          </Button>
        </form>
      </Form>
    </>
  )
}

function PasswordResetSkeleton() {
  const t = useTranslations("Auth.ForgotPasswordProceed")

  return (
    <>
      <AuthHeader
        title={t("resetPasswordTitle")}
        description={t("resetPasswordDescription")}
      />
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-full" />
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

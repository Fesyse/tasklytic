"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { env } from "@/env"
import { authClient } from "@/lib/auth-client"
import { verifyTurnstileToken } from "@/lib/turnstile"
import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from "next-turnstile"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { GoToInboxButton } from "../go-to-inbox-button"

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string({
    message: "You need to verify that you are human, click checkbox above"
  })
})

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema)
  })
  const email = form.watch("email")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [turnstileStatus, setTurnstileStatus] = useState<
    "success" | "error" | "expired" | "required"
  >("required")

  const onSubmit = async (data: ForgotPasswordSchema) => {
    if (turnstileStatus !== "success")
      return toast.error("Please verify you are not a robot")
    const success = await verifyTurnstileToken(data.turnstileToken)
    if (!success) return toast.error("Security check failed. Please try again.")

    setIsSubmitted(true)
    const { error } = await authClient.forgetPassword({
      email: data.email,
      redirectTo: "/auth/forgot-password/proceed"
    })

    if (error) {
      setIsSubmitted(false)
      return toast.error(error.message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="turnstileToken"
          render={({ field }) => (
            <FormItem>
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
                  toast.error("Security check failed. Please try again.")
                }}
                onExpire={() => {
                  setTurnstileStatus("expired")
                  toast.error("Security check expired. Please verify again.")
                }}
                onLoad={() => {
                  setTurnstileStatus("required")
                }}
                onVerify={(token) => {
                  field.onChange(token)
                  setTurnstileStatus("success")
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        {!isSubmitted ? (
          <Button className="mt-6 w-full">Send reset instructions</Button>
        ) : (
          <GoToInboxButton
            variant="outline"
            className="mt-6 w-full"
            email={email}
          />
        )}
      </form>
    </Form>
  )
}

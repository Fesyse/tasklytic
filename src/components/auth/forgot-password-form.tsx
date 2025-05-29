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
import { authClient } from "@/lib/auth-client"
import { verifyRecaptcha } from "@/lib/recaptcha"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { GoToInboxButton } from "../go-to-inbox-button"

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema)
  })
  const email = form.watch("email")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const onSubmit = async (data: ForgotPasswordSchema) => {
    if (!executeRecaptcha) return toast.error("Recaptcha is not loaded")

    const { recaptchaData, recaptchaError } = await verifyRecaptcha(
      executeRecaptcha,
      "forgot_password"
    )

    if (recaptchaError) return toast.error(recaptchaError.message)
    if (!recaptchaData?.success)
      return toast.error("Seems like you are a bot. Please try again.")

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

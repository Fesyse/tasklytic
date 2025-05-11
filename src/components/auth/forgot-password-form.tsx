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
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { GoToInboxButton } from "../go-to-inbox-button"

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema)
  })
  const email = form.watch("email")
  const [isClicked, setIsClicked] = useState(false)

  const onSubmit = async (data: ForgotPasswordSchema) => {
    setIsClicked(true)
    const { error } = await authClient.forgetPassword({
      email: data.email,
      redirectTo: "/auth/forgot-password/proceed"
    })

    if (error) {
      setIsClicked(false)
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
        {!isClicked ? (
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

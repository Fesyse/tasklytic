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
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { authClient } from "@/lib/auth-client"
import { verifyRecaptcha } from "@/lib/recaptcha"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo, useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const signUpSchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string()
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"]
      })
    }
  })

function AuthFormContent({
  className,
  type,
  ...props
}: React.ComponentProps<"form"> & { type: "sign-in" | "sign-up" }) {
  const searchParams = useSearchParams()
  const invitationId = searchParams.get("invitationId")
  const [isLoading, setIsLoading] = useState(false)

  const signUpCallbackUrl = useMemo(
    () =>
      invitationId
        ? `/accept-invitation?id=${invitationId}&isNewUser=1`
        : "/new-organization",
    [invitationId]
  )

  const { executeRecaptcha } = useGoogleReCaptcha()
  const router = useRouter()
  const form = useForm<z.infer<typeof signInSchema | typeof signUpSchema>>({
    resolver: zodResolver(type === "sign-in" ? signInSchema : signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: ""
    }
  })

  const handleSubmit = async (
    data: z.infer<
      typeof type extends "sign-in" ? typeof signInSchema : typeof signUpSchema
    >
  ) => {
    if (!executeRecaptcha) return toast.error("Recaptcha is not loaded")
    setIsLoading(true)

    const { recaptchaData, recaptchaError } = await verifyRecaptcha(
      executeRecaptcha,
      type.replace("-", "_")
    )

    if (recaptchaError) return toast.error(recaptchaError.message)
    if (!recaptchaData?.success) {
      toast.error("Seems like you are a bot. Please try again.")
      setIsLoading(false)
      return
    }

    if (type === "sign-in") {
      const { data: signInData, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard"
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success(`Signed in as "${signInData.user.name}" successfully!`)
        router.push("/dashboard")
      }

      setIsLoading(false)
    } else {
      const { data: newUser, error } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: signUpCallbackUrl
      })

      if (error) {
        toast.error(error.message)
      } else {
        if (!newUser?.user.emailVerified) {
          router.push(`/auth/verify-email?email=${data.email}`)
        }
      }

      setIsLoading(false)
    }
  }

  const handleSocialSignIn = (provider: "github" | "google") => () => {
    authClient.signIn.social({
      provider,
      callbackURL: invitationId
        ? `/accept-invitation?id=${invitationId}`
        : "/dashboard",
      newUserCallbackURL: signUpCallbackUrl
    })
  }

  return (
    <Form {...form}>
      <form
        {...props}
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(handleSubmit as any)}
      >
        <div className="grid gap-6">
          {type === "sign-up" && (
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  {type === "sign-in" && (
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {type === "sign-up" && (
            <FormField
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {type === "sign-in" ? "Sign in" : "Sign up"}
          </Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={handleSocialSignIn("github")}
          >
            <Icons.github className="mr-1 size-4" />
            Sign in with GitHub
          </Button>
          <Button
            variant="outline"
            className="-mt-3 w-full"
            type="button"
            onClick={handleSocialSignIn("google")}
          >
            <Icons.google className="mr-1 size-4" />
            Sign in with Google
          </Button>
        </div>
        <div className="text-center text-sm">
          {type === "sign-in"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <Link
            href={type === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}
            className="underline underline-offset-4"
          >
            Sign {type === "sign-in" ? "up" : "in"}
          </Link>
        </div>
      </form>
    </Form>
  )
}

// Export the component wrapped in Suspense
export function AuthForm(
  props: React.ComponentProps<"form"> & { type: "sign-in" | "sign-up" }
) {
  return (
    <Suspense fallback={<AuthFormSkeleton type={props.type} />}>
      <AuthFormContent {...props} />
    </Suspense>
  )
}

function AuthFormSkeleton({ type }: { type: "sign-in" | "sign-up" }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6">
        {type === "sign-up" && (
          <div className="grid gap-3">
            <div className="text-sm font-medium">Name</div>
            <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
          </div>
        )}
        <div className="grid gap-3">
          <div className="text-sm font-medium">Email</div>
          <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
        </div>
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Password</div>
          </div>
          <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
        </div>
        {type === "sign-up" && (
          <div className="grid gap-3">
            <div className="text-sm font-medium">Confirm Password</div>
            <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
          </div>
        )}
        <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
        <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
      </div>
    </div>
  )
}

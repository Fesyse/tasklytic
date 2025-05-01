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
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PasswordInput } from "./password-input"
import { Icons } from "./ui/icons"

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

export function SignInForm({
  className,
  type,
  ...props
}: React.ComponentProps<"form"> & { type: "sign-in" | "sign-up" }) {
  const form = useForm<z.infer<typeof signInSchema | typeof signUpSchema>>({
    resolver: zodResolver(type === "sign-in" ? signInSchema : signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: ""
    }
  })

  const handleSubmit = (
    data: z.infer<
      typeof type extends "sign-in" ? typeof signInSchema : typeof signUpSchema
    >
  ) => {
    if (type === "sign-in") {
      authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard"
      })
    } else {
      authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard"
      })
    }
  }

  const handleSocialSignIn = (provider: "github" | "google") => () => {
    authClient.signIn.social({
      provider,
      callbackURL: "/dashboard"
    })
  }

  return (
    <Form {...form}>
      <form
        {...props}
        className={cn("flex flex-col gap-6", className)}
        // @ts-expect-error - TODO: fix this
        onSubmit={form.handleSubmit(handleSubmit)}
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
          <Button type="submit" className="w-full">
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

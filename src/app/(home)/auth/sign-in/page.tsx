"use client"

import { DiscordLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Balancer from "react-wrap-balancer"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Separator } from "@/components/ui/separator"
import { signIn } from "@/lib/auth"

export default async function SignInPage() {
  const searchParams = useSearchParams()

  const signInWith = async (provider: "discord" | "google" | "github") => {
    const callbackUrl = searchParams.get("callbackUrl")
      ? decodeURIComponent(searchParams.get("callbackUrl")!)
      : "/projects"
    const callbackUrlSearchParams = new URLSearchParams({ callbackUrl })
    callbackUrlSearchParams.set("fromSignIn", "true")

    await signIn.social({
      provider,
      newUserCallbackURL: "/create-project",
      callbackURL: callbackUrl + `?${callbackUrlSearchParams.toString()}`
    })
  }

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Card className="mx-4 w-full max-w-md rounded-2xl border-0 bg-card p-6 shadow-lg md:mx-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account using one of the following options.
            </CardDescription>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signInWith("github")}
            >
              <GitHubLogoIcon className="mr-2 h-5 w-5" />
              Sign in with GitHub
            </Button>
            <Separator className="mx-auto w-4" />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signInWith("google")}
            >
              <Icons.google className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
            <Separator className="mx-auto w-4" />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signInWith("discord")}
            >
              <DiscordLogoIcon className="mr-2 h-5 w-5" />
              Sign in with Discord
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm font-thin">
              <Balancer>
                By signing in you accept our{" "}
                <Link className="underline" href="/terms-of-service">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="underline" href="/privacy-policy">
                  Privacy Policy
                </Link>
              </Balancer>
            </p>
          </CardFooter>
        </Card>
      </div>
      <div className="hidden bg-muted lg:block">
        <Icons.placeholder className="aspect-square h-full w-full object-cover dark:brightness-[0.375]" />
      </div>
    </>
  )
}

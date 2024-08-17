import { DiscordLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import { ContentLayout } from "@/components/layout/content-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Separator } from "@/components/ui/separator"

export default function SignInPage() {
  return (
    <ContentLayout
      title="Sign in"
      className="!p-0 lg:grid lg:grid-cols-2 max-w-full h-[calc(100vh-57px)] overflow-hidden"
    >
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
            <Button variant="outline" className="w-full">
              <GitHubLogoIcon className="mr-2 h-5 w-5" />
              Sign in with GitHub
            </Button>
            <Separator className="mx-auto w-4" />
            <Button variant="outline" className="w-full">
              <Icons.google className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
            <Separator className="mx-auto w-4" />
            <Button variant="outline" className="w-full">
              <DiscordLogoIcon className="mr-2 h-5 w-5" />
              Sign in with Discord
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          // create some image for this
          src="/placeholder.svg"
          alt="Image"
          width="480"
          height="480"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </ContentLayout>
  )
}

"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { authClient } from "@/lib/auth-client"
import { AlertCircle, Github, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type SocialProvider = "github" | "google"

type SocialAccount = {
  provider: SocialProvider
  connected: boolean
  email?: string
}

const defaultSocialAccounts = [
  { provider: "github", connected: false },
  { provider: "google", connected: false }
] as const

export function SocialLinking() {
  const { data: session } = authClient.useSession()
  const { data: userAccounts } = authClient.useListUserAccounts()

  const getDefaultSocialAccounts = () => {
    return defaultSocialAccounts.map<SocialAccount>((account) => ({
      ...account,
      email: session?.user.email,
      connected:
        userAccounts?.some(
          (userAccount) => userAccount.provider === account.provider
        ) ?? false
    }))
  }

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(
    getDefaultSocialAccounts()
  )

  const handleConnect = async (provider: SocialProvider) => {
    const { error } = await authClient.linkSocial({
      provider,
      callbackURL: "/settings/security"
    })

    if (error) {
      toast.error(`Failed to link ${provider} to your account`)
    } else {
      toast.success(
        `Redirecting to link ${provider} social provider to your account...`
      )
    }
  }

  const handleDisconnect = async (provider: SocialProvider) => {
    const { error } = await authClient.unlinkAccount({ providerId: provider })

    if (error) {
      console.error("Failed to disconnect account:", error)
      toast.error(`Failed to disconnect ${provider} account!`)
    } else {
      setSocialAccounts((accounts) =>
        accounts.map((account) =>
          account.provider === provider
            ? { ...account, connected: false, email: undefined }
            : account
        )
      )
      toast.success(`Successfully disconnected ${provider} account!`)
    }
  }

  const getProviderIcon = (provider: SocialProvider) => {
    switch (provider) {
      case "github":
        return <Github className="size-5" />
      case "google":
        return <Icons.google className="size-5" />
    }
  }

  const getProviderName = (provider: SocialProvider) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  useEffect(() => {
    setSocialAccounts(getDefaultSocialAccounts())
  }, [session, userAccounts])

  return (
    <section>
      <div className="flex flex-col space-y-1.5">
        <div className="flex flex-col space-y-1.5">
          <h3 className="leading-none font-semibold tracking-tight">
            Connected Accounts
          </h3>
          <p className="text-muted-foreground text-sm">
            Connect your social accounts to enable single sign-on and additional
            features
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-4">
        {socialAccounts.map((account) => (
          <div
            key={account.provider}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                {getProviderIcon(account.provider)}
              </div>
              <div>
                <p className="font-medium">
                  {getProviderName(account.provider)}
                </p>
                {account.connected ? (
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Mail className="mr-1 h-3 w-3" />
                    {account.email}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Not connected</p>
                )}
              </div>
            </div>
            <Button
              variant={account.connected ? "outline" : "default"}
              size="sm"
              onClick={() =>
                account.connected
                  ? handleDisconnect(account.provider)
                  : handleConnect(account.provider)
              }
            >
              {account.connected ? "Disconnect" : "Connect"}
            </Button>
          </div>
        ))}

        <Alert variant="warning" className="[&>svg~*]:pl-8">
          <AlertCircle className="size-5" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            In case email of your current social account(s) will unmatch with
            your current email, it will result an error.
          </AlertDescription>
        </Alert>
      </div>
    </section>
  )
}

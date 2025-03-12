"use client"

import { DiscordLogoIcon } from "@radix-ui/react-icons"
import { AlertCircle, Github, Mail } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { authClient } from "@/lib/auth"
import { type auth } from "@/server/auth"

type SocialProvider = "github" | "google" | "discord"

type SocialAccount = {
  provider: SocialProvider
  connected: boolean
  email?: string
}

type SocialLinkingProps = {
  userAccounts: Awaited<ReturnType<typeof auth.api.listUserAccounts>>
}

const defaultSocialAccounts = [
  { provider: "github", connected: false },
  { provider: "google", connected: false },
  { provider: "discord", connected: false }
] as const

export function SocialLinking({ userAccounts }: SocialLinkingProps) {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(
    defaultSocialAccounts.map<SocialAccount>(account => ({
      ...account,
      connected: userAccounts.some(
        userAccount => userAccount.provider === account.provider
      )
    }))
  )

  const handleConnect = async (provider: SocialProvider) => {
    try {
      await authClient.linkSocial({
        provider,
        callbackURL: window.location.origin
      })
    } catch (error) {
      console.error("Failed to connect account:", error)
      toast.error(`Failed to connect ${provider} account`)
    }
  }

  const handleDisconnect = async (provider: SocialProvider) => {
    try {
      await authClient.unlinkAccount({ providerId: provider })

      setSocialAccounts(accounts =>
        accounts.map(account =>
          account.provider === provider
            ? { ...account, connected: false, email: undefined }
            : account
        )
      )
      toast.success(`Successfully disconnected ${provider} account!`)
    } catch (error) {
      console.error("Failed to disconnect account:", error)
      toast.error(`Failed to disconnect ${provider} account!`)
    }
  }

  const getProviderIcon = (provider: SocialProvider) => {
    switch (provider) {
      case "github":
        return <Github className="size-5" />
      case "google":
        return <Icons.google className="size-5" />
      case "discord":
        return <DiscordLogoIcon className="size-5" />
    }
  }

  const getProviderName = (provider: SocialProvider) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  return (
    <section>
      <div className="flex flex-col space-y-1.5">
        <div className="flex flex-col space-y-1.5">
          <h3 className="font-semibold leading-none tracking-tight">
            Connected Accounts
          </h3>
          <p className="text-sm text-muted-foreground">
            Connect your social accounts to enable single sign-on and additional
            features
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-4">
        {socialAccounts.map(account => (
          <div
            key={account.provider}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                {getProviderIcon(account.provider)}
              </div>
              <div>
                <p className="font-medium">
                  {getProviderName(account.provider)}
                </p>
                {account.connected ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-1 h-3 w-3" />
                    {account.email}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not connected</p>
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

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertCircle className="size-5" />
          <p className="text-sm">
            Connecting accounts allows you to sign in with your preferred social
            provider.
          </p>
        </div>
      </div>
    </section>
  )
}

"use client"

import { DiscordLogoIcon } from "@radix-ui/react-icons"
import { AlertCircle, Github, Mail } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { type auth } from "@/server/auth"

type SocialAccount = {
  provider: string
  connected: boolean
  email?: string
}

type SocialLinkingProps = {
  userAccounts: Awaited<ReturnType<typeof auth.api.listUserAccounts>>
}

export function SocialLinking({ userAccounts }: SocialLinkingProps) {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(
    [
      { provider: "github", connected: false },
      { provider: "google", connected: false },
      { provider: "discord", connected: false }
    ].map<SocialAccount>(account => ({
      ...account,
      connected: userAccounts.some(
        userAccount => userAccount.provider === account.provider
      )
    }))
  )

  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleConnect = async (provider: string) => {
    setIsLoading(provider)

    try {
      // This is where you would integrate with better-auth
      // Example: await betterAuth.connectSocialProvider(provider)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSocialAccounts(accounts =>
        accounts.map(account =>
          account.provider === provider
            ? { ...account, connected: true, email: `user@${provider}.com` }
            : account
        )
      )
    } catch (error) {
      console.error("Failed to connect account:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleDisconnect = async (provider: string) => {
    setIsLoading(provider)

    try {
      // This is where you would integrate with better-auth
      // Example: await betterAuth.disconnectSocialProvider(provider)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSocialAccounts(accounts =>
        accounts.map(account =>
          account.provider === provider
            ? { ...account, connected: false, email: undefined }
            : account
        )
      )
    } catch (error) {
      console.error("Failed to disconnect account:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <Github className="size-5" />
      case "google":
        return <Icons.google className="size-5" />
      case "discord":
        return <DiscordLogoIcon className="size-5" />
    }
  }

  const getProviderName = (provider: string) => {
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
              disabled={isLoading !== null}
            >
              {isLoading === account.provider ? (
                <span className="flex items-center gap-1">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {account.connected ? "Disconnecting..." : "Connecting..."}
                </span>
              ) : account.connected ? (
                "Disconnect"
              ) : (
                "Connect"
              )}
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

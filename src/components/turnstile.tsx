import { env } from "@/env"
import {
  Turnstile as CloudflareTurnstile,
  type TurnstileProps as CloudflareTurnstileProps
} from "next-turnstile"

type TurnstileProps = Omit<CloudflareTurnstileProps, "sandbox" | "siteKey">

export function Turnstile({
  retry = "auto",
  refreshExpired = "auto",
  ...props
}: TurnstileProps) {
  return (
    <CloudflareTurnstile
      sandbox={process.env.NODE_ENV === "development" ? "pass" : undefined}
      siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      retry={retry}
      refreshExpired={refreshExpired}
      {...props}
    />
  )
}

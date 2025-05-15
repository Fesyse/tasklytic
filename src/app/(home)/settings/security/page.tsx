import { SettingsSecurity } from "@/components/settings/security"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings - Security"
}

export default function SettingsSecurityPage() {
  return <SettingsSecurity />
}

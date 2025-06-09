import { SettingsProfile } from "@/components/settings/profile"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings"
}

export default function SettingsPage() {
  return <SettingsProfile />
}

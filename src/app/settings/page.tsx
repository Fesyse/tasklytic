import { Settings } from "@/components/blocks/settings"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Change your and application settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Settings />
      </CardContent>
    </Card>
  )
}
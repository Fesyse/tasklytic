import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Settings } from "@/components/blocks/settings"

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

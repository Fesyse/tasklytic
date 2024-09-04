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
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Change your and application settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Settings />
        </CardContent>
      </Card>
    </div>
  )
}

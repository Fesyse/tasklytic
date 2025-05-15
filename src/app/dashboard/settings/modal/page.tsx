import { SettingsProfile } from "@/components/settings/profile"
import { SettingsSecurity } from "@/components/settings/security"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings Modal"
}

export default function SettingsModalPage() {
  return (
    <div className="bg-background mx-auto max-w-4xl rounded-lg p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsProfile />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security and authentication settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsSecurity />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

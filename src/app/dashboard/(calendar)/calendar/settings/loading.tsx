import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

export default function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your calendar preferences and working hours.
        </p>
      </div>
      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">Calendar Preferences</TabsTrigger>
          <TabsTrigger value="working-hours">Working Hours</TabsTrigger>
        </TabsList>
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Preferences</CardTitle>
              <CardDescription>
                Configure how your calendar looks and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="working-hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your working hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="grid grid-cols-3 items-center gap-4">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

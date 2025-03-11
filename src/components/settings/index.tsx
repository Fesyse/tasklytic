import {
  type LucideProps,
  Layers,
  LayoutDashboard,
  SettingsIcon,
  UserRound
} from "lucide-react"
import Link from "next/link"
import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AccountSettings } from "./account-settings"
import { GeneralSettings } from "./general-settings"

export type SettingsTab = {
  title: "General" | "Account" | "Appearance" | "Integrations"
  icon: React.FC<LucideProps>
  content: React.FC
}

const tabs: SettingsTab[] = [
  { title: "General", icon: SettingsIcon, content: GeneralSettings },
  { title: "Account", icon: UserRound, content: AccountSettings },
  {
    title: "Appearance",
    icon: LayoutDashboard,
    content: () => <div>Appearance</div>
  },
  {
    title: "Integrations",
    icon: Layers,
    content: () => <div>Integrations</div>
  }
]

type SettingsProps = {
  className?: string
  tab: SettingsTab["title"]
}

export const Settings: React.FC<SettingsProps> = ({ className, tab }) => {
  return (
    <Tabs className={cn("flex gap-6", className)} defaultValue={tab}>
      <TabsList className="flex flex-col items-start justify-start space-y-3 min-h-96 bg-transparent px-2 py-4 border-r">
        {/* Tab triggers */}
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.title}
            value={tab.title}
            className="flex justify-start gap-2 w-full"
            asChild
          >
            <Link href={`/settings/${tab.title}`}>
              <tab.icon className="size-4" />
              {tab.title}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex flex-col space-y-3 w-full">
        {/* Tab content's */}
        {tabs.map(tab => (
          <TabsContent
            key={tab.title}
            value={tab.title}
            className="flex flex-col space-y-3"
          >
            <tab.content />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

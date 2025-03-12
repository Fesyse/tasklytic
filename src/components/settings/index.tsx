import {
  type LucideProps,
  Layers,
  LayoutDashboard,
  SettingsIcon,
  UserRound
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
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
    <Tabs
      className={cn("flex flex-col md:flex-row items-stretch gap-6", className)}
      defaultValue={tab}
    >
      <TabsList className="flex flex-row md:flex-col items-start justify-start md:space-y-3 bg-transparent px-2 pt-4 md:pb-4 h-full">
        {/* Tab triggers */}
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.title}
            value={tab.title}
            className="flex justify-start gap-2 w-full"
          >
            <tab.icon className="size-4" />
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>
      <Separator orientation="vertical" className="hidden md:block" />
      <Separator orientation="horizontal" className="md:hidden block" />

      <div className="flex flex-col space-y-3 w-full">
        {/* Tab content's */}
        {tabs.map(tab => (
          <TabsContent
            key={tab.title}
            value={tab.title}
            className="flex flex-col space-y-3 py-1 pr-6"
          >
            <tab.content />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

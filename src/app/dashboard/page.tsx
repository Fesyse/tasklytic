"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconSelector } from "@/components/ui/icon-selector"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export default function DashboardPage() {
  const [selectedIcon, setSelectedIcon] = useState<{
    type: "emoji" | "lucide" | "upload"
    value: string
  } | null>(null)

  const renderSelectedIcon = () => {
    if (!selectedIcon)
      return (
        <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-lg">
          No icon
        </div>
      )

    if (selectedIcon.type === "emoji") {
      return (
        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg text-2xl">
          {selectedIcon.value}
        </div>
      )
    }

    if (selectedIcon.type === "lucide") {
      return <RenderLucideIcon selectedIcon={selectedIcon} />
    }

    return (
      <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-lg">
        Upload
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="bg-background min-h-screen p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold">
                Notion-Style Icon Selector
              </h1>
              <p className="text-muted-foreground">
                Choose from emojis, Lucide React icons, or upload your own
              </p>
            </div>

            <div className="flex items-start justify-center gap-8">
              <IconSelector
                onSelect={setSelectedIcon}
                selectedIcon={selectedIcon ?? undefined}
              />

              <Card className="w-64">
                <CardHeader>
                  <CardTitle className="text-lg">Selected Icon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    {renderSelectedIcon()}
                    <div className="flex-1">
                      {selectedIcon ? (
                        <div>
                          <p className="font-medium capitalize">
                            {selectedIcon.type}
                          </p>
                          <p className="text-muted-foreground truncate text-sm">
                            {selectedIcon.value}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Select an icon</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        )
      </div>
    </div>
  )
}

function RenderLucideIcon({
  selectedIcon
}: {
  selectedIcon: { type: string; value: string }
}) {
  const { data: LucideIcons } = useQuery({
    queryKey: ["lucide-icons"],
    queryFn: () => import("lucide-react")
  })

  const IconComponent = LucideIcons
    ? (LucideIcons[selectedIcon.value as keyof typeof LucideIcons] as any)
    : undefined

  return (
    <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
      {IconComponent && <IconComponent size={24} />}
    </div>
  )
}

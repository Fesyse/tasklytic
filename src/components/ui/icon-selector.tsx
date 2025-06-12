import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch
} from "@/components/ui/emoji-picker"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import Fuse from "fuse.js"
import { icons, Search, Upload } from "lucide-react"
import React, { Suspense, useMemo, useState } from "react"
import { FixedSizeList } from "react-window"
import { Input } from "./input"
import { Separator } from "./separator"

// Get all Lucide icon names
const lucideIconNames = Object.keys(icons)

type IconSelectorProps = {
  onSelect: (icon: {
    type: "emoji" | "lucide" | "upload"
    value: string
  }) => void
  selectedIcon?: { type: "emoji" | "lucide" | "upload"; value: string }
}

const COLUMNS = 11

export function IconSelector({ onSelect, selectedIcon }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("emoji")
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)

  // Initialize Fuse.js for Lucide icons
  const fuse = useMemo(() => {
    return new Fuse(lucideIconNames, {
      keys: ["name"],
      includeScore: true,
      threshold: 0.3 // Adjust threshold as needed
    })
  }, [])

  // Filter Lucide icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchTerm.length) return lucideIconNames

    return fuse.search(searchTerm).map((result) => result.item)
  }, [searchTerm])

  return (
    <Card className="w-96 overflow-hidden p-0">
      <Tabs
        value={activeTab}
        onValueChange={(tab) => {
          setSearchTerm("")
          setActiveTab(tab)
        }}
        className="w-full space-y-2"
      >
        <div className="space-y-1 pt-2">
          <TabsList className="flex w-full justify-start bg-transparent px-2">
            <TabsPrimitive.Trigger value="emoji" asChild>
              <Button
                className="data-[state='active']:text-foreground flex-0 rounded-lg"
                variant="ghost"
                size="sm"
              >
                Emoji
              </Button>
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger value="icons" asChild>
              <Button
                className="data-[state='active']:text-foreground flex-0 rounded-lg"
                variant="ghost"
                size="sm"
              >
                Icons
              </Button>
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger value="upload" asChild>
              <Button
                className="data-[state='active']:text-foreground flex-0 rounded-lg"
                variant="ghost"
                size="sm"
              >
                Upload
              </Button>
            </TabsPrimitive.Trigger>
          </TabsList>
          <Separator />
        </div>

        <div className="space-y-2 px-2 pb-2">
          {activeTab === "icons" && (
            <div className="relative w-full">
              <Search className="text-muted-foreground absolute top-1/2 left-2 z-10 size-4 -translate-y-1/2 transform" />
              <Input
                type="text"
                className="pl-8 text-xs"
                placeholder="Search icon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <TabsContent value="emoji">
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                onSelect({ type: "emoji", value: emoji.emoji })
              }}
              className="max-h-80 w-full [&_[data-slot='emoji-picker-emoji']]:size-8"
              columns={COLUMNS + 2}
            >
              <EmojiPickerSearch placeholder="Search emojis..." />
              <EmojiPickerContent className="scrollbar-hide min-h-40" />
              <EmojiPickerFooter />
            </EmojiPicker>
          </TabsContent>

          <TabsContent value="icons">
            <FixedSizeList
              height={filteredIcons.length === 0 ? 0 : 64 * 4}
              itemCount={filteredIcons.length}
              itemSize={8 * 4}
              width={COLUMNS * (8 * 4)}
              itemData={{
                onSelect,
                filteredIcons,
                selectedIcon,
                setHoveredIcon
              }}
              className="scrollbar-hide mx-auto"
            >
              {LucideIconRow}
            </FixedSizeList>
            {filteredIcons.length === 0 && (
              <div className="text-muted-foreground flex min-h-40 items-center justify-center text-center text-sm">
                No icons found.
              </div>
            )}
            <div className="flex w-full min-w-0 items-center gap-1 border-t p-2">
              {hoveredIcon ? (
                <div className="flex h-7 flex-none items-center justify-center">
                  <Suspense
                    fallback={
                      <div className="bg-muted animate-pulse rounded" />
                    }
                  >
                    {icons[hoveredIcon as keyof typeof icons] &&
                      React.createElement(
                        icons[hoveredIcon as keyof typeof icons],
                        { size: 20 }
                      )}
                  </Suspense>
                  <span className="ml-2 truncate text-xs">{hoveredIcon}</span>
                </div>
              ) : (
                <span className="text-muted-foreground ml-1.5 flex h-7 items-center truncate text-xs">
                  Select an icons...
                </span>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="border-muted-foreground/25 flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <Upload className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-4 text-center text-sm">
                Upload a custom icon
              </p>
              <Button variant="outline" className="mb-2">
                Choose File
              </Button>
              <p className="text-muted-foreground text-center text-xs">
                Supports PNG, JPG, SVG up to 2MB
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}

type LucideIconRowProps = {
  index: number
  style: React.CSSProperties
  data: {
    onSelect: IconSelectorProps["onSelect"]
    filteredIcons: string[]
    selectedIcon?: IconSelectorProps["selectedIcon"]
    setHoveredIcon: React.Dispatch<React.SetStateAction<string | null>>
  }
}

function LucideIconRow({ index, style, data }: LucideIconRowProps) {
  const { onSelect, filteredIcons, selectedIcon, setHoveredIcon } = data
  const startIndex = index * COLUMNS
  const endIndex = Math.min(startIndex + COLUMNS, filteredIcons.length)
  const iconsInRow = filteredIcons.slice(startIndex, endIndex)

  return (
    <div
      style={{
        ...style,
        gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`
      }}
      className="grid gap-1"
    >
      {iconsInRow.map((iconName) => {
        const IconComponent = icons[iconName as keyof typeof icons] as any
        return (
          <Button
            key={iconName}
            variant={selectedIcon?.value === iconName ? "default" : "ghost"}
            size="sm"
            className="hover:bg-accent h-8 w-8 p-0"
            onClick={() => onSelect({ type: "lucide", value: iconName })}
            onMouseEnter={() => setHoveredIcon(iconName)}
            onMouseLeave={() => setHoveredIcon(null)}
            title={iconName}
          >
            <Suspense
              fallback={<div className="bg-muted h-8 animate-pulse rounded" />}
            >
              {IconComponent ? <IconComponent className="!size-6" /> : null}
            </Suspense>
          </Button>
        )
      })}
    </div>
  )
}

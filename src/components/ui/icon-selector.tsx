import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch
} from "@/components/ui/emoji-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Fuse from "fuse.js"
import { icons, Search, Upload } from "lucide-react"
import React, { Suspense, useMemo, useState } from "react"
import { FixedSizeList } from "react-window"

// Get all Lucide icon names
const lucideIconNames = Object.keys(icons)

type IconSelectorProps = {
  onSelect: (icon: {
    type: "emoji" | "lucide" | "upload"
    value: string
  }) => void
  selectedIcon?: { type: "emoji" | "lucide" | "upload"; value: string }
}

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
    <Card className="w-82 overflow-hidden p-2">
      <Tabs
        value={activeTab}
        onValueChange={(tab) => {
          setSearchTerm("")
          setActiveTab(tab)
        }}
        className="w-full"
      >
        <TabsList className="flex w-full bg-transparent">
          <TabsTrigger
            value="emoji"
            className="flex items-center gap-2 bg-transparent"
          >
            Emoji
          </TabsTrigger>
          <TabsTrigger
            value="icons"
            className="flex items-center gap-2 bg-transparent"
          >
            Icons
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            className="flex items-center gap-2 bg-transparent"
          >
            Upload
          </TabsTrigger>
        </TabsList>

        {activeTab === "icons" && (
          <div className="flex h-9 items-center gap-2 border-b px-3">
            <Search className="size-4 shrink-0 opacity-50" />
            <input
              className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
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
            columns={10}
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
            width={80 * 4 - 10}
            itemData={{ onSelect, filteredIcons, selectedIcon, setHoveredIcon }}
            className="scrollbar-hide"
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
                  fallback={<div className="bg-muted animate-pulse rounded" />}
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
                Select an icon...
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
  const columns = 9

  const { onSelect, filteredIcons, selectedIcon, setHoveredIcon } = data
  const startIndex = index * columns
  const endIndex = Math.min(startIndex + columns, filteredIcons.length)
  const iconsInRow = filteredIcons.slice(startIndex, endIndex)

  return (
    <div
      style={{
        ...style,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
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
              {IconComponent ? <IconComponent size={24} /> : null}
            </Suspense>
          </Button>
        )
      })}
    </div>
  )
}

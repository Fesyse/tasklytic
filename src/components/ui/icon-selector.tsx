"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as LucideIcons from "lucide-react"
import {
  ImagesIcon as Icons,
  ImageIcon,
  Search,
  Smile,
  Upload
} from "lucide-react"
import { Suspense, useMemo, useState } from "react"

// Common emojis organized by category
const emojiCategories: Record<string, string[]> = {
  "Smileys & People": [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳"
  ],
  "Animals & Nature": [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🐣",
    "🐥",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝"
  ],
  "Food & Drink": [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
    "🥦",
    "🥬",
    "🥒",
    "🌶️",
    "🌽",
    "🥕",
    "🧄",
    "🧅",
    "🥔",
    "🍠",
    "🥐",
    "🍞"
  ],
  Activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
    "⛳",
    "🪁",
    "🏹",
    "🎣",
    "🤿",
    "🥊",
    "🥋",
    "🎽",
    "🛹",
    "🛷",
    "⛸️"
  ],
  Objects: [
    "⌚",
    "📱",
    "📲",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "🕹️",
    "🗜️",
    "💽",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📽️",
    "🎞️",
    "📞",
    "☎️",
    "📟",
    "📠",
    "📺",
    "📻",
    "🎙️",
    "🎚️"
  ]
}

// Get all Lucide icon names
const lucideIconNames = Object.keys(LucideIcons).filter(
  ([name]) => name !== "default" && name !== "createLucideIcon"
)

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

  // Filter emojis based on search
  const filteredEmojis = useMemo(() => {
    if (!searchTerm) return emojiCategories

    const filtered: typeof emojiCategories = {}
    Object.entries(emojiCategories).forEach(([category, emojis]) => {
      const matchingEmojis = emojis.filter(() =>
        category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (matchingEmojis.length > 0) {
        filtered[category] = matchingEmojis
      }
    })
    return filtered
  }, [searchTerm])

  // Filter Lucide icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchTerm.length) return lucideIconNames.slice(0, 100) // Show first 100 icons initially
    return lucideIconNames
      .filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 50) // Limit search results
  }, [searchTerm])

  const LazyIcon = ({ iconName }: { iconName: string }) => {
    const IconComponent = LucideIcons[
      iconName as keyof typeof LucideIcons
    ] as any
    return IconComponent ? <IconComponent size={20} /> : null
  }

  return (
    <Card className="w-80 p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emoji" className="flex items-center gap-2">
            <Smile size={16} />
            Emoji
          </TabsTrigger>
          <TabsTrigger value="icons" className="flex items-center gap-2">
            <Icons size={16} />
            Icons
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <ImageIcon size={16} />
            Upload
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="relative">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform"
              size={16}
            />
            <Input
              placeholder={
                activeTab === "emoji"
                  ? "Search emojis..."
                  : activeTab === "icons"
                    ? "Search icons..."
                    : "Upload custom icon"
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={activeTab === "upload"}
            />
          </div>
        </div>

        <TabsContent value="emoji" className="mt-4">
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {Object.entries(filteredEmojis).map(([category, emojis]) => (
                <div key={category}>
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {category}
                  </Badge>
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => (
                      <Button
                        key={`${emoji}-${index}`}
                        variant={
                          selectedIcon?.type === "emoji" &&
                          selectedIcon?.value === emoji
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        className="hover:bg-accent h-8 w-8 p-0 text-lg"
                        onClick={() =>
                          onSelect({ type: "emoji", value: emoji })
                        }
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="icons" className="mt-4">
          <ScrollArea className="h-64">
            <div className="grid grid-cols-6 gap-1">
              {filteredIcons.map((iconName) => (
                <Button
                  key={iconName}
                  variant={
                    selectedIcon?.type === "lucide" &&
                    selectedIcon?.value === iconName
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="hover:bg-accent h-10 w-10 p-0"
                  onClick={() => onSelect({ type: "lucide", value: iconName })}
                  title={iconName}
                >
                  <Suspense
                    fallback={
                      <div className="bg-muted h-5 w-5 animate-pulse rounded" />
                    }
                  >
                    <LazyIcon iconName={iconName} />
                  </Suspense>
                </Button>
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                No icons found matching "{searchTerm}"
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
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

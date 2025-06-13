import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
  EmojiRandomPicker
} from "@/components/ui/emoji-picker"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { useUploadFile } from "@/hooks/use-upload-file"
import { getCroppedImg } from "@/lib/crop-image"
import { getRandomInt } from "@/lib/utils"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import Fuse from "fuse.js"
import { icons, Search, ShuffleIcon, UploadIcon } from "lucide-react"
import React, { Suspense, useCallback, useMemo, useState } from "react"
import Cropper from "react-easy-crop"
import { FixedSizeList } from "react-window"
import { toast } from "sonner"
import { Input } from "./input"
import { LucideIconRow } from "./lucide-icon-row"
import { Separator } from "./separator"

// Get all Lucide icon names
const lucideIconNames = Object.keys(icons)

export type SelectedIcon = {
  type: "emoji" | "lucide" | "upload"
  value: string
}

export type IconSelectorProps = {
  onSelect: (
    icon: {
      type: "emoji" | "lucide" | "upload"
      value: string
    } | null
  ) => void
  selectedIcon?: SelectedIcon
}

const COLUMNS = 11

type EmojiTabContentProps = {
  onSelect: IconSelectorProps["onSelect"]
  COLUMNS: number
}

function EmojiTabContent({ onSelect, COLUMNS }: EmojiTabContentProps) {
  return (
    <TabsContent value="emoji">
      <EmojiPicker
        onEmojiSelect={(emoji) => {
          onSelect({ type: "emoji", value: emoji.emoji })
        }}
        className="max-h-80 w-full [&_[data-slot='emoji-picker-emoji']]:size-8"
        columns={COLUMNS + 2}
      >
        <div className="flex gap-2 px-2">
          <EmojiPickerSearch placeholder="Search emojis..." />
          <EmojiRandomPicker
            onRandomEmojiSelect={(emoji) => {
              onSelect({ type: "emoji", value: emoji.emoji })
            }}
            variant="secondary"
            size="icon"
          />
        </div>
        <EmojiPickerContent className="scrollbar-hide min-h-40 px-2" />
        <EmojiPickerFooter className="px-4" />
      </EmojiPicker>
    </TabsContent>
  )
}

type IconsTabContentProps = {
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  setRandomIcon: () => void
  filteredIcons: string[]
  onSelect: IconSelectorProps["onSelect"]
  selectedIcon?: IconSelectorProps["selectedIcon"]
  setHoveredIcon: React.Dispatch<React.SetStateAction<string | null>>
  hoveredIcon: string | null
  COLUMNS: number
}

function IconsTabContent({
  searchTerm,
  setSearchTerm,
  setRandomIcon,
  filteredIcons,
  onSelect,
  selectedIcon,
  setHoveredIcon,
  hoveredIcon,
  COLUMNS
}: IconsTabContentProps) {
  return (
    <TabsContent value="icons">
      <div className="flex gap-2 px-2 pb-2">
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
        <Button variant="secondary" size="icon" onClick={setRandomIcon}>
          <ShuffleIcon />
        </Button>
      </div>

      <FixedSizeList
        height={filteredIcons.length === 0 ? 0 : 57.75 * 4}
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
      <div className="flex w-full min-w-0 items-center gap-1 border-t p-2 px-4">
        {hoveredIcon ? (
          <div className="flex h-7 flex-none items-center justify-center">
            <Suspense
              fallback={<div className="bg-muted animate-pulse rounded" />}
            >
              {icons[hoveredIcon as keyof typeof icons] &&
                React.createElement(icons[hoveredIcon as keyof typeof icons], {
                  size: 20
                })}
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
  )
}

type UploadTabContentProps = {
  onUploadComplete: (imageUrl: string) => void
  onUploadError: (error: Error) => void
  onSelect: IconSelectorProps["onSelect"]
}

function UploadTabContent({
  onUploadComplete,
  onUploadError,
  onSelect
}: UploadTabContentProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const { uploadFile, isUploading } = useUploadFile("iconUploadter", {
    onUploadComplete: (file) => {
      onUploadComplete(file.url)
      onSelect({ type: "upload", value: file.ufsUrl })
    },
    onUploadError: (error) => onUploadError(error as Error)
  })

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const onFileChange = async (file: File) => {
    if (!file) return
    let imageDataUrl: string = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.addEventListener(
        "load",
        () => resolve(reader.result as string),
        false
      )
      reader.readAsDataURL(file)
    })
    setImageSrc(imageDataUrl)
  }

  const showCroppedImage = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return

      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)

      if (croppedImage) {
        // Convert base64 to Blob
        const response = await fetch(croppedImage)
        const blob = await response.blob()
        const file = new File([blob], `icon_${crypto.randomUUID()}.png`, {
          type: "image/png"
        })

        uploadFile(file)
      }
    } catch (e) {
      console.error(e)
      onUploadError(e as Error)
    }
  }, [imageSrc, croppedAreaPixels, onUploadError, uploadFile])

  return (
    <TabsContent value="upload" className="p-2 pt-0">
      <div className="space-y-4">
        {!imageSrc ? (
          <div
            className="text-muted-foreground flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-md border border-dashed text-sm"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0]
                if (file) {
                  onFileChange(file)
                }
              }
            }}
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "image/*"
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement
                if (target.files && target.files.length > 0) {
                  const file = target.files[0]
                  if (file) {
                    onFileChange(file)
                  }
                }
              }
              input.click()
            }}
          >
            <UploadIcon className="size-8" />
            Drag & drop an image or click to select
          </div>
        ) : (
          <div className="relative h-64 w-full overflow-hidden rounded-md border">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              restrictPosition={true}
              onMediaLoaded={(mediaSize) => {
                setZoom(364 / mediaSize.naturalWidth)
              }}
            />
          </div>
        )}

        {imageSrc && (
          <div className="space-y-2">
            <div className="flex flex-col justify-center">
              <Slider
                id="zoom"
                min={2.5}
                max={10}
                step={0.1}
                value={[zoom]}
                onValueChange={([val]: [number]) => setZoom(val)}
                className="w-full"
              />
              <div className="flex justify-between">
                <div className="text-muted-foreground">+</div>
                <div className="text-muted-foreground">-</div>
              </div>
            </div>

            <Button onClick={showCroppedImage} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Crop & Upload"}
            </Button>
          </div>
        )}
      </div>
    </TabsContent>
  )
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

  function setRandomIcon() {
    const iconName =
      lucideIconNames[getRandomInt(0, lucideIconNames.length - 1)]!

    const newIcon: SelectedIcon = {
      type: "lucide",
      value: iconName
    }
    onSelect(newIcon)
  }

  function removeIcon() {
    onSelect(null)
  }

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
          <div className="flex justify-between px-2">
            <TabsList className="flex justify-start bg-transparent">
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
            <Button
              onClick={() => removeIcon()}
              variant="ghost"
              size="sm"
              className="text-muted-foreground rounded-lg"
            >
              Remove
            </Button>
          </div>
          <Separator />
        </div>

        <div className="space-y-2">
          <EmojiTabContent onSelect={onSelect} COLUMNS={COLUMNS} />
          <IconsTabContent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setRandomIcon={setRandomIcon}
            filteredIcons={filteredIcons}
            onSelect={onSelect}
            selectedIcon={selectedIcon}
            setHoveredIcon={setHoveredIcon}
            hoveredIcon={hoveredIcon}
            COLUMNS={COLUMNS}
          />
          <UploadTabContent
            onUploadComplete={(imageUrl) => {
              onSelect({ type: "upload", value: imageUrl })
            }}
            onUploadError={(error: Error) => {
              toast.error(`There was and error uploading your image`, {
                description: error.message
              })
            }}
            onSelect={onSelect}
          />
        </div>
      </Tabs>
    </Card>
  )
}

"use client"

import {
  type Emoji,
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
  type Locale
} from "frimousse"
import { LoaderIcon, SearchIcon, Shuffle } from "lucide-react"
import type * as React from "react"

import { useEmojiData } from "@/hooks/use-emoji-data"
import { cn, getRandomInt } from "@/lib/utils"
import { useLocale } from "next-intl"
import { Button, type ButtonProps } from "./button"
import { inputVariants } from "./input"

function EmojiPicker({
  className,
  ...props
}: React.ComponentProps<typeof EmojiPickerPrimitive.Root>) {
  const locale = useLocale()
  return (
    <EmojiPickerPrimitive.Root
      className={cn(
        "bg-popover text-popover-foreground isolate flex h-full w-fit flex-col overflow-hidden rounded-md",
        className
      )}
      locale={locale as Locale}
      data-slot="emoji-picker"
      {...props}
    />
  )
}

function EmojiPickerSearch({
  className,
  ...props
}: React.ComponentProps<typeof EmojiPickerPrimitive.Search>) {
  return (
    <div
      className={cn("relative w-full", className)}
      data-slot="emoji-picker-search-wrapper"
    >
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-2 z-10 size-4 -translate-y-1/2 transform" />
      <EmojiPickerPrimitive.Search
        className={cn(inputVariants(), "!overflow-auto pl-8 text-xs")}
        data-slot="emoji-picker-search"
        {...props}
      />
    </div>
  )
}

function EmojiRandomPicker({
  onClick,
  onRandomEmojiSelect,
  children,
  ...props
}: ButtonProps & { onRandomEmojiSelect: (emoji: Emoji) => void }) {
  const { data: emojis, isLoading } = useEmojiData()
  const setRandomEmoji = () => {
    if (isLoading || !emojis) return

    const emoji = emojis[getRandomInt(0, emojis.length - 1)]!
    onRandomEmojiSelect(emoji)
  }

  return (
    <Button
      onClick={(e) => {
        setRandomEmoji()
        onClick?.(e)
      }}
      {...props}
    >
      {children ?? <Shuffle />}
    </Button>
  )
}

function EmojiPickerRow({ children, ...props }: EmojiPickerListRowProps) {
  return (
    <div {...props} className="scroll-my-1 px-1" data-slot="emoji-picker-row">
      {children}
    </div>
  )
}

function EmojiPickerEmoji({
  emoji,
  className,
  ...props
}: EmojiPickerListEmojiProps) {
  return (
    <button
      {...props}
      className={cn(
        "data-[active]:bg-accent flex size-7 items-center justify-center rounded-sm text-base",
        className
      )}
      data-slot="emoji-picker-emoji"
    >
      {emoji.emoji}
    </button>
  )
}

function EmojiPickerCategoryHeader({
  category,
  ...props
}: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      {...props}
      className="bg-popover text-muted-foreground px-3 pt-3.5 pb-2 text-xs leading-none"
      data-slot="emoji-picker-category-header"
    >
      {category.label}
    </div>
  )
}

function EmojiPickerContent({
  className,
  ...props
}: React.ComponentProps<typeof EmojiPickerPrimitive.Viewport>) {
  return (
    <EmojiPickerPrimitive.Viewport
      className={cn("relative flex-1 outline-hidden", className)}
      data-slot="emoji-picker-viewport"
      {...props}
    >
      <EmojiPickerPrimitive.Loading
        className="text-muted-foreground absolute inset-0 flex items-center justify-center"
        data-slot="emoji-picker-loading"
      >
        <LoaderIcon className="size-4 animate-spin" />
      </EmojiPickerPrimitive.Loading>
      <EmojiPickerPrimitive.Empty
        className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm"
        data-slot="emoji-picker-empty"
      >
        No emoji found.
      </EmojiPickerPrimitive.Empty>
      <EmojiPickerPrimitive.List
        className="pb-1 select-none"
        components={{
          Row: EmojiPickerRow,
          Emoji: EmojiPickerEmoji,
          CategoryHeader: EmojiPickerCategoryHeader
        }}
        data-slot="emoji-picker-list"
      />
    </EmojiPickerPrimitive.Viewport>
  )
}

function EmojiPickerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full max-w-(--frimousse-viewport-width) min-w-0 items-center gap-1 border-t p-2",
        className
      )}
      data-slot="emoji-picker-footer"
      {...props}
    >
      <EmojiPickerPrimitive.ActiveEmoji>
        {({ emoji }) =>
          emoji ? (
            <>
              <div className="flex size-7 flex-none items-center justify-center text-lg">
                {emoji.emoji}
              </div>
              <span className="text-secondary-foreground truncate text-xs">
                {emoji.label}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground ml-1.5 flex h-7 items-center truncate text-xs">
              Select an emoji…
            </span>
          )
        }
      </EmojiPickerPrimitive.ActiveEmoji>
    </div>
  )
}

export {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
  EmojiRandomPicker
}

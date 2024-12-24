"use client"

import { type Emoji } from "@udecode/plate-emoji"
import {
  type EmojiDropdownMenuOptions,
  useEmojiDropdownMenuState
} from "@udecode/plate-emoji/react"
import { Smile } from "lucide-react"
import React from "react"
import { emojiCategoryIcons, emojiSearchIcons } from "./emoji-icons"
import { EmojiPicker } from "./emoji-picker"
import { EmojiToolbarDropdown } from "./emoji-toolbar-dropdown"
import { ToolbarButton } from "./toolbar"

type EmojiDropdownMenuProps = {
  isWithEditor?: boolean
  options?: EmojiDropdownMenuOptions
  onSelectEmoji?: (emoji: Emoji) => void
  icon?: React.ReactNode
} & React.ComponentPropsWithoutRef<typeof ToolbarButton>

export function EmojiDropdownMenu({
  isWithEditor = true,
  options,
  onSelectEmoji,
  icon,
  ...props
}: EmojiDropdownMenuProps) {
  const { emojiPickerState, isOpen, setIsOpen } =
    useEmojiDropdownMenuState(options)

  return (
    <EmojiToolbarDropdown
      control={
        isWithEditor ? (
          <ToolbarButton pressed={isOpen} tooltip="Emoji" isDropdown {...props}>
            {icon ?? <Smile />}
          </ToolbarButton>
        ) : (
          (icon ?? <Smile size={24} />)
        )
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <EmojiPicker
        {...emojiPickerState}
        onSelectEmoji={onSelectEmoji ?? emojiPickerState.onSelectEmoji}
        icons={{
          categories: emojiCategoryIcons,
          search: emojiSearchIcons
        }}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        settings={options?.settings}
      />
    </EmojiToolbarDropdown>
  )
}

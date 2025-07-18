"use client"

import * as React from "react"

import type { UseEmojiPickerType } from "@udecode/plate-emoji/react"

export type EmojiPickerSearchBarProps = {
  children: React.ReactNode
} & Pick<UseEmojiPickerType, "i18n" | "searchValue" | "setSearch">

export function EmojiPickerSearchBar({
  children,
  i18n,
  searchValue,
  setSearch
}: EmojiPickerSearchBarProps) {
  return (
    <div className="flex items-center px-2">
      <div className="relative flex grow items-center">
        <input
          className="bg-muted placeholder:text-muted-foreground block w-full appearance-none rounded-full border-0 px-10 py-2 text-sm outline-none focus-visible:outline-none"
          value={searchValue}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={i18n.search}
          aria-label="Search"
          autoComplete="off"
          type="text"
          autoFocus
        />
        {children}
      </div>
    </div>
  )
}

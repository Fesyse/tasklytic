"use client"

import { SuggestionPlugin } from "@udecode/plate-suggestion/react"
import { useEditorPlugin, usePluginOption } from "@udecode/plate/react"
import { PencilLineIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { useTranslations } from "next-intl"
import { ToolbarButton } from "./toolbar"

export function SuggestionToolbarButton() {
  const t = useTranslations(
    "Dashboard.Note.Editor.Elements.FloatingToolbarButtons"
  )
  const { setOption } = useEditorPlugin(SuggestionPlugin)
  const isSuggesting = usePluginOption(SuggestionPlugin, "isSuggesting")

  return (
    <ToolbarButton
      className={cn(isSuggesting && "text-brand/80 hover:text-brand/80")}
      onClick={() => setOption("isSuggesting", !isSuggesting)}
      onMouseDown={(e) => e.preventDefault()}
      tooltip={t("suggestionEdits", {
        isSuggesting: isSuggesting ? "true" : "false"
      })}
    >
      <PencilLineIcon />
    </ToolbarButton>
  )
}

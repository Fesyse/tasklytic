"use client"

import * as React from "react"

import { insertInlineEquation } from "@udecode/plate-math"
import { useEditorRef } from "@udecode/plate/react"
import { RadicalIcon } from "lucide-react"

import { useTranslations } from "next-intl"
import { ToolbarButton } from "./toolbar"

export function InlineEquationToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const t = useTranslations(
    "Dashboard.Note.Editor.Elements.FloatingToolbarButtons"
  )
  const editor = useEditorRef()

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        insertInlineEquation(editor)
      }}
      tooltip={t("markAsEquation")}
    >
      <RadicalIcon />
    </ToolbarButton>
  )
}

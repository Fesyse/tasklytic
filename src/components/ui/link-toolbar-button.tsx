"use client"

import * as React from "react"

import {
  useLinkToolbarButton,
  useLinkToolbarButtonState
} from "@udecode/plate-link/react"
import { Link } from "lucide-react"

import { useTranslations } from "next-intl"
import { ToolbarButton } from "./toolbar"

export function LinkToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const t = useTranslations(
    "Dashboard.Note.Editor.Elements.FloatingToolbarButtons"
  )
  const state = useLinkToolbarButtonState()
  const { props: buttonProps } = useLinkToolbarButton(state)

  return (
    <ToolbarButton
      {...props}
      {...buttonProps}
      data-plate-focus
      tooltip={t("link")}
    >
      <Link />
    </ToolbarButton>
  )
}

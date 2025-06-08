"use client"

import * as React from "react"

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu"

import {
  SubscriptPlugin,
  SuperscriptPlugin
} from "@udecode/plate-basic-marks/react"
import { KbdPlugin } from "@udecode/plate-kbd/react"
import { useEditorRef } from "@udecode/plate/react"
import {
  KeyboardIcon,
  MoreHorizontalIcon,
  SubscriptIcon,
  SuperscriptIcon
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { useTranslations } from "next-intl"
import { ToolbarButton } from "./toolbar"

export function MoreDropdownMenu(props: DropdownMenuProps) {
  const t = useTranslations(
    "Dashboard.Note.Editor.Elements.FloatingToolbarButtons.Insert"
  )
  const editor = useEditorRef()
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip={t("label")}>
          <MoreHorizontalIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar flex max-h-[500px] min-w-[180px] flex-col overflow-y-auto"
        align="start"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              editor.tf.toggleMark(KbdPlugin.key)
              editor.tf.collapse({ edge: "end" })
              editor.tf.focus()
            }}
          >
            <KeyboardIcon />
            {t("keyboardInput")}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              editor.tf.toggleMark(SuperscriptPlugin.key, {
                remove: SubscriptPlugin.key
              })
              editor.tf.focus()
            }}
          >
            <SuperscriptIcon />
            {t("superscript")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              editor.tf.toggleMark(SubscriptPlugin.key, {
                remove: SuperscriptPlugin.key
              })
              editor.tf.focus()
            }}
          >
            <SubscriptIcon />
            {t("subscript")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

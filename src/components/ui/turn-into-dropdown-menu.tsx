"use client"

import * as React from "react"

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu"
import type { TElement } from "@udecode/plate"

import { DropdownMenuItemIndicator } from "@radix-ui/react-dropdown-menu"
import { BlockquotePlugin } from "@udecode/plate-block-quote/react"
import { CodeBlockPlugin } from "@udecode/plate-code-block/react"
import { HEADING_KEYS } from "@udecode/plate-heading"
import { INDENT_LIST_KEYS, ListStyleType } from "@udecode/plate-indent-list"
import { TogglePlugin } from "@udecode/plate-toggle/react"
import {
  ParagraphPlugin,
  useEditorRef,
  useSelectionFragmentProp
} from "@udecode/plate/react"
import {
  CheckIcon,
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon
} from "lucide-react"

import {
  getBlockType,
  setBlockType,
  STRUCTURAL_TYPES
} from "@/components/editor/transforms"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { useTranslations } from "next-intl"
import { ToolbarButton, ToolbarMenuGroup } from "./toolbar"

export function TurnIntoDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef()
  const [open, setOpen] = React.useState(false)

  const t = useTranslations(
    "Dashboard.Note.Editor.Elements.TurnIntoDropdownMenu"
  )

  const turnIntoItems = React.useMemo(
    () => [
      {
        icon: <PilcrowIcon />,
        keywords: ["paragraph"],
        label: t("items.text"),
        value: ParagraphPlugin.key
      },
      {
        icon: <Heading1Icon />,
        keywords: ["title", "h1"],
        label: t("items.heading1"),
        value: HEADING_KEYS.h2
      },
      {
        icon: <Heading2Icon />,
        keywords: ["subtitle", "h2"],
        label: t("items.heading2"),
        value: HEADING_KEYS.h3
      },
      {
        icon: <Heading3Icon />,
        keywords: ["subtitle", "h3"],
        label: t("items.heading3"),
        value: HEADING_KEYS.h4
      },
      {
        icon: <ListIcon />,
        keywords: ["unordered", "ul", "-"],
        label: t("items.bulletedList"),
        value: ListStyleType.Disc
      },
      {
        icon: <ListOrderedIcon />,
        keywords: ["ordered", "ol", "1"],
        label: t("items.numberedList"),
        value: ListStyleType.Decimal
      },
      {
        icon: <SquareIcon />,
        keywords: ["checklist", "task", "checkbox", "[]"],
        label: t("items.todoList"),
        value: INDENT_LIST_KEYS.todo
      },
      {
        icon: <ChevronRightIcon />,
        keywords: ["collapsible", "expandable"],
        label: t("items.toggleList"),
        value: TogglePlugin.key
      },
      {
        icon: <FileCodeIcon />,
        keywords: ["```"],
        label: t("items.code"),
        value: CodeBlockPlugin.key
      },
      {
        icon: <QuoteIcon />,
        keywords: ["citation", "blockquote", ">"],
        label: t("items.quote"),
        value: BlockquotePlugin.key
      },
      {
        icon: <Columns3Icon />,
        label: t("items.threeColumns"),
        value: "action_three_columns"
      }
    ],
    [t]
  )

  const value = useSelectionFragmentProp({
    defaultValue: ParagraphPlugin.key,
    structuralTypes: STRUCTURAL_TYPES,
    getProp: (node) => getBlockType(node as TElement)
  })
  const selectedItem = React.useMemo(
    () =>
      turnIntoItems.find(
        (item) => item.value === (value ?? ParagraphPlugin.key)
      ) ?? turnIntoItems[0],
    [value, turnIntoItems]
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className="min-w-[125px]"
          pressed={open}
          tooltip={t("turnInto")}
          isDropdown
        >
          {selectedItem.label}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar min-w-0"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          editor.tf.focus()
        }}
        align="start"
      >
        <ToolbarMenuGroup
          value={value}
          onValueChange={(type) => {
            setBlockType(editor, type)
          }}
          label={t("turnInto")}
        >
          {turnIntoItems.map(({ icon, label, value: itemValue }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              className="min-w-[180px] pl-2 *:first:[span]:hidden"
              value={itemValue}
            >
              <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
                <DropdownMenuItemIndicator>
                  <CheckIcon />
                </DropdownMenuItemIndicator>
              </span>
              {icon}
              {label}
            </DropdownMenuRadioItem>
          ))}
        </ToolbarMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

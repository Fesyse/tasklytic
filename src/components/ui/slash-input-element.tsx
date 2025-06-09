"use client"

import * as React from "react"

import type { TSlashInputElement } from "@udecode/plate-slash-command"

import { AIChatPlugin } from "@udecode/plate-ai/react"
import { BlockquotePlugin } from "@udecode/plate-block-quote/react"
import { CalloutPlugin } from "@udecode/plate-callout/react"
import { CodeBlockPlugin } from "@udecode/plate-code-block/react"
import { DatePlugin } from "@udecode/plate-date/react"
import { HEADING_KEYS } from "@udecode/plate-heading"
import { TocPlugin } from "@udecode/plate-heading/react"
import { INDENT_LIST_KEYS, ListStyleType } from "@udecode/plate-indent-list"
import { EquationPlugin, InlineEquationPlugin } from "@udecode/plate-math/react"
import { TablePlugin } from "@udecode/plate-table/react"
import { TogglePlugin } from "@udecode/plate-toggle/react"
import {
  type PlateEditor,
  type PlateElementProps,
  ParagraphPlugin,
  PlateElement
} from "@udecode/plate/react"
import {
  CalendarIcon,
  ChevronRightIcon,
  Code2,
  Columns3Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  LightbulbIcon,
  ListIcon,
  ListOrdered,
  PilcrowIcon,
  Quote,
  RadicalIcon,
  SparklesIcon,
  Square,
  Table,
  TableOfContentsIcon
} from "lucide-react"

import {
  insertBlock,
  insertInlineElement
} from "@/components/editor/transforms"

import { useTranslations } from "next-intl"
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem
} from "./inline-combobox"

type Group = {
  group: string
  items: Item[]
}

interface Item {
  icon: React.ReactNode
  value: string
  onSelect: (editor: PlateEditor, value: string) => void
  className?: string
  focusEditor?: boolean
  keywords?: string[]
  label?: string
}

function getGroups(
  t: ReturnType<
    typeof useTranslations<"Dashboard.Note.Editor.Elements.SlashInputElement.groups">
  >
): Group[] {
  return [
    {
      group: t("AI.label"),
      items: [
        {
          focusEditor: false,
          icon: <SparklesIcon />,
          value: t("AI.items.ai"),
          onSelect: (editor) => {
            editor.getApi(AIChatPlugin).aiChat.show()
          }
        }
      ]
    },
    {
      group: t("BasicBlocks.label"),
      items: [
        {
          icon: <PilcrowIcon />,
          keywords: ["paragraph"],
          label: t("BasicBlocks.items.text"),
          value: ParagraphPlugin.key
        },
        {
          icon: <Heading1Icon />,
          keywords: ["title", "h1"],
          label: t("BasicBlocks.items.heading1"),
          value: HEADING_KEYS.h2
        },
        {
          icon: <Heading2Icon />,
          keywords: ["subtitle", "h2"],
          label: t("BasicBlocks.items.heading2"),
          value: HEADING_KEYS.h3
        },
        {
          icon: <Heading3Icon />,
          keywords: ["subtitle", "h3"],
          label: t("BasicBlocks.items.heading3"),
          value: HEADING_KEYS.h4
        },
        {
          icon: <ListIcon />,
          keywords: ["unordered", "ul", "-"],
          label: t("BasicBlocks.items.bulletedList"),
          value: ListStyleType.Disc
        },
        {
          icon: <ListOrdered />,
          keywords: ["ordered", "ol", "1"],
          label: t("BasicBlocks.items.numberedList"),
          value: ListStyleType.Decimal
        },
        {
          icon: <Square />,
          keywords: ["checklist", "task", "checkbox", "[]"],
          label: t("BasicBlocks.items.todoList"),
          value: INDENT_LIST_KEYS.todo
        },
        {
          icon: <ChevronRightIcon />,
          keywords: ["collapsible", "expandable"],
          label: t("BasicBlocks.items.toggle"),
          value: TogglePlugin.key
        },
        {
          icon: <Code2 />,
          keywords: ["```"],
          label: t("BasicBlocks.items.codeBlock"),
          value: CodeBlockPlugin.key
        },
        {
          icon: <Table />,
          label: t("BasicBlocks.items.table"),
          value: TablePlugin.key
        },
        {
          icon: <Quote />,
          keywords: ["citation", "blockquote", "quote", ">"],
          label: t("BasicBlocks.items.blockquote"),
          value: BlockquotePlugin.key
        },
        {
          description: "Insert a highlighted block.",
          icon: <LightbulbIcon />,
          keywords: ["note"],
          label: t("BasicBlocks.items.callout"),
          value: CalloutPlugin.key
        }
      ].map((item) => ({
        ...item,
        onSelect: (editor, value) => {
          insertBlock(editor, value)
        }
      }))
    },
    {
      group: t("AdvancedBlocks.label"),
      items: [
        {
          icon: <TableOfContentsIcon />,
          keywords: ["toc"],
          label: t("AdvancedBlocks.items.toc"),
          value: TocPlugin.key
        },
        {
          icon: <Columns3Icon />,
          label: t("AdvancedBlocks.items.threeColumns"),
          value: "action_three_columns"
        },
        {
          focusEditor: false,
          icon: <RadicalIcon />,
          label: t("AdvancedBlocks.items.equation"),
          value: EquationPlugin.key
        }
      ].map((item) => ({
        ...item,
        onSelect: (editor, value) => {
          insertBlock(editor, value)
        }
      }))
    },
    {
      group: t("Inline.label"),
      items: [
        {
          focusEditor: true,
          icon: <CalendarIcon />,
          keywords: ["time"],
          label: t("Inline.items.date"),
          value: DatePlugin.key
        },
        {
          focusEditor: false,
          icon: <RadicalIcon />,
          label: t("Inline.items.inlineEquation"),
          value: InlineEquationPlugin.key
        }
      ].map((item) => ({
        ...item,
        onSelect: (editor, value) => {
          insertInlineElement(editor, value)
        }
      }))
    }
  ]
}

export function SlashInputElement(
  props: PlateElementProps<TSlashInputElement>
) {
  const t = useTranslations(
    "Dashboard.Note.Editor.Elements.SlashInputElement.groups"
  )
  const { editor, element } = props

  const groups = React.useMemo(() => getGroups(t), [t])

  return (
    <PlateElement {...props} as="span" data-slate-value={element.value}>
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          {groups.map(({ group, items }) => (
            <InlineComboboxGroup key={group}>
              <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

              {items.map(
                ({ focusEditor, icon, keywords, label, value, onSelect }) => (
                  <InlineComboboxItem
                    key={value}
                    value={value}
                    onClick={() => onSelect(editor, value)}
                    label={label}
                    focusEditor={focusEditor}
                    group={group}
                    keywords={keywords}
                  >
                    <div className="text-muted-foreground mr-2">{icon}</div>
                    {label ?? value}
                  </InlineComboboxItem>
                )
              )}
            </InlineComboboxGroup>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  )
}

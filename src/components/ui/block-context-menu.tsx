"use client"

import * as React from "react"

import { AIChatPlugin } from "@udecode/plate-ai/react"
import { BlockquotePlugin } from "@udecode/plate-block-quote/react"
import { HEADING_KEYS } from "@udecode/plate-heading"
import { IndentListPlugin } from "@udecode/plate-indent-list/react"
import {
  BLOCK_CONTEXT_MENU_ID,
  BlockMenuPlugin,
  BlockSelectionPlugin
} from "@udecode/plate-selection/react"
import {
  ParagraphPlugin,
  useEditorPlugin,
  usePlateState
} from "@udecode/plate/react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { useIsTouchDevice } from "@/hooks/use-is-touch-device"
import {
  AlignCenter,
  AlignRight,
  Bot,
  Copy,
  Heading2,
  Heading3,
  Indent,
  Outdent,
  Quote,
  Trash,
  Type,
  WandSparkles
} from "lucide-react"
import { useTranslations } from "next-intl"

type Value = "askAI" | null

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const { api, editor } = useEditorPlugin(BlockMenuPlugin)
  const [value, setValue] = React.useState<Value>(null)
  const isTouch = useIsTouchDevice()
  const [readOnly] = usePlateState("readOnly")

  const t = useTranslations("Dashboard.Note.Editor.Elements.BlockContextMenu")

  const handleTurnInto = React.useCallback(
    (type: string) => {
      editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getNodes()
        .forEach(([node, path]) => {
          if (node[IndentListPlugin.key]) {
            editor.tf.unsetNodes([IndentListPlugin.key, "indent"], {
              at: path
            })
          }

          editor.tf.toggleBlock(type, { at: path })
        })
    },
    [editor]
  )

  const handleAlign = React.useCallback(
    (align: "center" | "left" | "right") => {
      editor
        .getTransforms(BlockSelectionPlugin)
        .blockSelection.setNodes({ align })
    },
    [editor]
  )

  if (isTouch) {
    return children
  }

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (!open) {
          // prevent unselect the block selection
          setTimeout(() => {
            api.blockMenu.hide()
          }, 0)
        }
      }}
      modal={false}
    >
      <ContextMenuTrigger
        asChild
        onContextMenu={(event) => {
          const dataset = (event.target as HTMLElement).dataset

          const disabled = dataset?.slateEditor === "true" || readOnly

          if (disabled) return event.preventDefault()

          api.blockMenu.show(BLOCK_CONTEXT_MENU_ID, {
            x: event.clientX,
            y: event.clientY
          })
        }}
      >
        <div className="w-full">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="w-64"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          editor.getApi(BlockSelectionPlugin).blockSelection.focus()

          if (value === "askAI") {
            editor.getApi(AIChatPlugin).aiChat.show()
          }

          setValue(null)
        }}
      >
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => {
              setValue("askAI")
            }}
          >
            <Bot className="mr-2 h-4 w-4" />
            {t("askAI")}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              editor
                .getTransforms(BlockSelectionPlugin)
                .blockSelection.duplicate()
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t("duplicate")}
            {/* <ContextMenuShortcut>⌘ + D</ContextMenuShortcut> */}
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <WandSparkles className="text-muted-foreground mr-4 size-4" />
              {t("turnInto")}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                onClick={() => handleTurnInto(ParagraphPlugin.key)}
              >
                <Type className="mr-2 h-4 w-4" />
                {t("items.paragraph")}
              </ContextMenuItem>

              <ContextMenuItem onClick={() => handleTurnInto(HEADING_KEYS.h2)}>
                <Heading2 className="mr-2 h-4 w-4" />
                {t("items.heading2")}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleTurnInto(HEADING_KEYS.h3)}>
                <Heading3 className="mr-2 h-4 w-4" />
                {t("items.heading3")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleTurnInto(BlockquotePlugin.key)}
              >
                <Quote className="mr-2 h-4 w-4" />
                {t("items.blockquote")}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>

        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() =>
              editor
                .getTransforms(BlockSelectionPlugin)
                .blockSelection.setIndent(1)
            }
          >
            <Indent className="mr-2 h-4 w-4" />
            {t("indent")}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              editor
                .getTransforms(BlockSelectionPlugin)
                .blockSelection.setIndent(-1)
            }
          >
            <Outdent className="mr-2 h-4 w-4" />
            {t("outdent")}
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <WandSparkles className="text-muted-foreground mr-4 size-4" />
              {t("align")}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={() => handleAlign("left")}>
                <AlignRight className="mr-2 h-4 w-4" />
                {t("alignItems.left")}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleAlign("center")}>
                <AlignCenter className="mr-2 h-4 w-4" />
                {t("alignItems.center")}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleAlign("right")}>
                <AlignRight className="mr-2 h-4 w-4" />
                {t("alignItems.right")}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
        <ContextMenuItem
          onClick={() => {
            editor
              .getTransforms(BlockSelectionPlugin)
              .blockSelection.removeNodes()
            editor.tf.focus()
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          {t("delete")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

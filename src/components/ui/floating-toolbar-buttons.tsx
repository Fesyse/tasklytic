"use client"

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin
} from "@udecode/plate-basic-marks/react"
import { useEditorReadOnly } from "@udecode/plate/react"
import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon
} from "lucide-react"

import { useTranslations } from "next-intl"
import { AIToolbarButton } from "./ai-toolbar-button"
import { CommentToolbarButton } from "./comment-toolbar-button"
import { InlineEquationToolbarButton } from "./inline-equation-toolbar-button"
import { LinkToolbarButton } from "./link-toolbar-button"
import { MarkToolbarButton } from "./mark-toolbar-button"
import { MoreDropdownMenu } from "./more-dropdown-menu"
import { SuggestionToolbarButton } from "./suggestion-toolbar-button"
import { ToolbarGroup } from "./toolbar"
import { TurnIntoDropdownMenu } from "./turn-into-dropdown-menu"

export function FloatingToolbarButtons() {
  const t = useTranslations(
    "Dashboard.Note.Editor.Elements.FloatingToolbarButtons"
  )
  const readOnly = useEditorReadOnly()

  return (
    <>
      {!readOnly && (
        <>
          <ToolbarGroup>
            <AIToolbarButton tooltip="AI commands">
              <WandSparklesIcon />
              {t("askAI")}
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <TurnIntoDropdownMenu />

            <MarkToolbarButton
              nodeType={BoldPlugin.key}
              tooltip={`${t("bold")} (⌘+B)`}
            >
              <BoldIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip={`${t("italic")} (⌘+I)`}
            >
              <ItalicIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={UnderlinePlugin.key}
              tooltip={`${t("underline")} (⌘+U)`}
            >
              <UnderlineIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={StrikethroughPlugin.key}
              tooltip={`${t("strikethrough")} (⌘+⇧+M)`}
            >
              <StrikethroughIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={CodePlugin.key}
              tooltip={`${t("code")} (⌘+E)`}
            >
              <Code2Icon />
            </MarkToolbarButton>

            <InlineEquationToolbarButton />

            <LinkToolbarButton />
          </ToolbarGroup>
        </>
      )}

      <ToolbarGroup>
        <CommentToolbarButton />
        <SuggestionToolbarButton />

        {!readOnly && <MoreDropdownMenu />}
      </ToolbarGroup>
    </>
  )
}

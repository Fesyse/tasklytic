import * as React from "react"

import { type SlateEditor, NodeApi } from "@udecode/plate"
import { AIChatPlugin, AIPlugin } from "@udecode/plate-ai/react"
import { useIsSelecting } from "@udecode/plate-selection/react"
import {
  type PlateEditor,
  useEditorRef,
  usePluginOption
} from "@udecode/plate/react"
import {
  Album,
  BadgeHelp,
  BookOpenCheck,
  Check,
  CornerUpLeft,
  FeatherIcon,
  ListEnd,
  ListMinus,
  ListPlus,
  PenLine,
  SmileIcon,
  Wand,
  X
} from "lucide-react"

import { CommandGroup, CommandItem } from "@/components/ui/command"
import { useTranslations } from "next-intl"

export type EditorChatState =
  | "cursorCommand"
  | "cursorSuggestion"
  | "selectionCommand"
  | "selectionSuggestion"

type AiChatItem = {
  icon: React.ReactNode
  label: string
  value: string
  component?: React.ComponentType<{ menuState: EditorChatState }>
  filterItems?: boolean
  items?: { label: string; value: string }[]
  shortcut?: string
  onSelect?: ({
    aiEditor,
    editor
  }: {
    aiEditor: SlateEditor
    editor: PlateEditor
  }) => void
}

type AiChatItems = {
  [K in keyof ReturnType<typeof getAiChatItems>]: AiChatItem
}

const getAiChatItems = (
  t: ReturnType<
    typeof useTranslations<"Dashboard.Note.Editor.Elements.AIMenu.items">
  >
) =>
  ({
    accept: {
      icon: <Check />,
      label: t("accept"),
      value: "accept",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        editor.getTransforms(AIChatPlugin).aiChat.accept()
        editor.tf.focus({ edge: "end" })
      }
    },
    continueWrite: {
      icon: <PenLine />,
      label: t("continueWriting"),
      value: "continueWrite",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        const ancestorNode = editor.api.block({ highest: true })

        if (!ancestorNode) return

        const isEmpty = NodeApi.string(ancestorNode[0]).trim().length === 0

        void editor.getApi(AIChatPlugin).aiChat.submit({
          mode: "insert",
          prompt: isEmpty
            ? t("prompts.continueWritingEmpty", { editor: "{editor}" })
            : t("prompts.continueWritingNonEmpty")
        })
      }
    },
    discard: {
      icon: <X />,
      label: t("discard"),
      shortcut: "Escape",
      value: "discard",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        editor.getTransforms(AIPlugin).ai?.undo()
        editor.getApi(AIChatPlugin).aiChat.hide()
      }
    },
    emojify: {
      icon: <SmileIcon />,
      label: t("emojify"),
      value: "emojify",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t("prompts.emojify")
        })
      }
    },
    explain: {
      icon: <BadgeHelp />,
      label: t("explain"),
      value: "explain",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: {
            default: t("prompts.explainDefault", { editor: "{editor}" }),
            selecting: t("prompts.explainSelecting")
          }
        })
      }
    },
    fixSpelling: {
      icon: <Check />,
      label: t("fixSpellingGrammar"),
      value: "fixSpelling",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t("prompts.fixSpellingGrammar")
        })
      }
    },
    generateMarkdownSample: {
      icon: <BookOpenCheck />,
      label: t("generateMarkdownSample"),
      value: "generateMarkdownSample",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t("prompts.generateMarkdownSample")
        })
      }
    },
    generateMdxSample: {
      icon: <BookOpenCheck />,
      label: t("generateMdxSample"),
      value: "generateMdxSample",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t("prompts.generateMdxSample")
        })
      }
    },
    improveWriting: {
      icon: <Wand />,
      label: t("improveWriting"),
      value: "improveWriting",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t("prompts.improveWriting")
        })
      }
    },
    insertBelow: {
      icon: <ListEnd />,
      label: t("insertBelow"),
      value: "insertBelow",
      onSelect: ({
        aiEditor,
        editor
      }: {
        aiEditor: SlateEditor
        editor: PlateEditor
      }) => {
        void editor.getTransforms(AIChatPlugin).aiChat.insertBelow(aiEditor)
      }
    },
    makeLonger: {
      icon: <ListPlus />,
      label: t("makeLonger"),
      value: "makeLonger",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t("prompts.makeLonger")
        })
      }
    },
    makeShorter: {
      icon: <ListMinus />,
      label: t("makeShorter"),
      value: "makeShorter",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t("prompts.makeShorter")
        })
      }
    },
    replace: {
      icon: <Check />,
      label: t("replaceSelection"),
      value: "replace",
      onSelect: ({
        aiEditor,
        editor
      }: {
        aiEditor: SlateEditor
        editor: PlateEditor
      }) => {
        void editor
          .getTransforms(AIChatPlugin)
          .aiChat.replaceSelection(aiEditor)
      }
    },
    simplifyLanguage: {
      icon: <FeatherIcon />,
      label: t("simplifyLanguage"),
      value: "simplifyLanguage",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t("prompts.simplifyLanguage")
        })
      }
    },
    summarize: {
      icon: <Album />,
      label: t("addSummary"),
      value: "summarize",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          mode: "insert",
          prompt: {
            default: t("prompts.addSummaryDefault", { editor: "{editor}" }),
            selecting: t("prompts.addSummarySelecting")
          }
        })
      }
    },
    tryAgain: {
      icon: <CornerUpLeft />,
      label: t("tryAgain"),
      value: "tryAgain",
      onSelect: ({ editor }: { editor: PlateEditor }) => {
        void editor.getApi(AIChatPlugin).aiChat.reload()
      }
    }
  }) as const

type MenuStateItems = Record<
  EditorChatState,
  {
    items: AiChatItem[]
    heading?: string
  }[]
>

const menuStateItems = (aiChatItemsFn: AiChatItems): MenuStateItems => ({
  cursorCommand: [
    {
      items: [
        aiChatItemsFn.generateMdxSample,
        aiChatItemsFn.generateMarkdownSample,
        aiChatItemsFn.continueWrite,
        aiChatItemsFn.summarize,
        aiChatItemsFn.explain
      ]
    }
  ],
  cursorSuggestion: [
    {
      items: [
        aiChatItemsFn.accept,
        aiChatItemsFn.discard,
        aiChatItemsFn.tryAgain
      ]
    }
  ],
  selectionCommand: [
    {
      items: [
        aiChatItemsFn.improveWriting,
        aiChatItemsFn.emojify,
        aiChatItemsFn.makeLonger,
        aiChatItemsFn.makeShorter,
        aiChatItemsFn.fixSpelling,
        aiChatItemsFn.simplifyLanguage
      ]
    }
  ],
  selectionSuggestion: [
    {
      items: [
        aiChatItemsFn.replace,
        aiChatItemsFn.insertBelow,
        aiChatItemsFn.discard,
        aiChatItemsFn.tryAgain
      ]
    }
  ]
})

export const AIMenuItems = ({
  setValue
}: {
  setValue: (value: string) => void
}) => {
  const editor = useEditorRef()
  const { messages } = usePluginOption(AIChatPlugin, "chat")
  const aiEditor = usePluginOption(AIChatPlugin, "aiEditor")!
  const isSelecting = useIsSelecting()

  const t = useTranslations("Dashboard.Note.Editor.Elements.AIMenu.items")
  const translatedAiChatItems = React.useMemo(() => getAiChatItems(t), [t])

  const menuState = React.useMemo(() => {
    if (messages && messages.length > 0) {
      return isSelecting ? "selectionSuggestion" : "cursorSuggestion"
    }

    return isSelecting ? "selectionCommand" : "cursorCommand"
  }, [isSelecting, messages])

  const menuGroups = React.useMemo(() => {
    const items = menuStateItems(translatedAiChatItems)[menuState]

    return items
  }, [menuState, translatedAiChatItems])

  React.useEffect(() => {
    if (menuGroups.length > 0 && (menuGroups[0]?.items.length ?? 0) > 0) {
      const value = menuGroups[0]?.items[0]?.value
      if (!value) return

      setValue(value)
    }
  }, [menuGroups, setValue])

  return (
    <>
      {menuGroups.map((group, index: number) => (
        <CommandGroup key={index} heading={group.heading}>
          {group.items.map((menuItem) => (
            <CommandItem
              key={menuItem.value}
              className="[&_svg]:text-muted-foreground"
              value={menuItem.value}
              onSelect={() => {
                menuItem.onSelect?.({
                  aiEditor,
                  editor: editor
                })
              }}
            >
              {menuItem.icon}
              <span>{menuItem.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  )
}

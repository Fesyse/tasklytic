"use client"

import * as React from "react"

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu"

import { getEditorDOMFromHtmlString } from "@udecode/plate"
import { MarkdownPlugin } from "@udecode/plate-markdown"
import { useEditorRef } from "@udecode/plate/react"
import { ArrowUpToLineIcon, CodeXml, Heading1 } from "lucide-react"
import { useFilePicker } from "use-file-picker"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useTranslations } from "next-intl"

type ImportType = "html" | "markdown"

export function ImportActionButton(props: DropdownMenuProps) {
  const t = useTranslations("Dashboard.Note.Header.NoteNavActions.Import")
  const editor = useEditorRef()
  const [open, setOpen] = React.useState(false)

  const getFileNodes = (text: string, type: ImportType) => {
    if (type === "html") {
      const editorNode = getEditorDOMFromHtmlString(text)
      const nodes = editor.api.html.deserialize({
        element: editorNode
      })

      return nodes
    }

    if (type === "markdown") {
      return editor.getApi(MarkdownPlugin).markdown.deserialize(text)
    }

    return []
  }

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: [".md", ".mdx"],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text()

      const nodes = getFileNodes(text, "markdown")

      editor.tf.insertNodes(nodes)
    }
  })

  const { openFilePicker: openHtmlFilePicker } = useFilePicker({
    accept: ["text/html"],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text()

      const nodes = getFileNodes(text, "html")

      editor.tf.insertNodes(nodes)
    }
  })

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
          <ArrowUpToLineIcon />
          <span>{t("import")}</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={openHtmlFilePicker}>
            {t("html")}
            <CodeXml className="ml-auto" />
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={openMdFilePicker}>
            {t("markdown")}
            <Heading1 className="ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

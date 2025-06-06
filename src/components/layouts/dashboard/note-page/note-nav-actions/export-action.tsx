"use client"

import * as React from "react"

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu"

import { withProps } from "@udecode/cn"
import {
  BaseParagraphPlugin,
  createSlateEditor,
  serializeHtml,
  SlateLeaf
} from "@udecode/plate"
import { BaseAlignPlugin } from "@udecode/plate-alignment"
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin
} from "@udecode/plate-basic-marks"
import { BaseBlockquotePlugin } from "@udecode/plate-block-quote"
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin
} from "@udecode/plate-code-block"
import { BaseCommentsPlugin } from "@udecode/plate-comments"
import { BaseDatePlugin } from "@udecode/plate-date"
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin
} from "@udecode/plate-font"
import {
  BaseHeadingPlugin,
  BaseTocPlugin,
  HEADING_KEYS,
  HEADING_LEVELS
} from "@udecode/plate-heading"
import { BaseHighlightPlugin } from "@udecode/plate-highlight"
import { BaseHorizontalRulePlugin } from "@udecode/plate-horizontal-rule"
import { BaseIndentPlugin } from "@udecode/plate-indent"
import { BaseIndentListPlugin } from "@udecode/plate-indent-list"
import { BaseKbdPlugin } from "@udecode/plate-kbd"
import { BaseColumnItemPlugin, BaseColumnPlugin } from "@udecode/plate-layout"
import { BaseLineHeightPlugin } from "@udecode/plate-line-height"
import { BaseLinkPlugin } from "@udecode/plate-link"
import { MarkdownPlugin } from "@udecode/plate-markdown"
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin
} from "@udecode/plate-math"
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin
} from "@udecode/plate-media"
import { BaseMentionPlugin } from "@udecode/plate-mention"
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin
} from "@udecode/plate-table"
import { BaseTogglePlugin } from "@udecode/plate-toggle"
import { useEditorRef } from "@udecode/plate/react"
import { all, createLowlight } from "lowlight"
import {
  ArrowDownToLineIcon,
  CodeXml,
  FileText,
  Heading1,
  Image
} from "lucide-react"

import { BlockquoteElementStatic } from "@/components/ui/blockquote-element-static"
import { CodeBlockElementStatic } from "@/components/ui/code-block-element-static"
import { CodeLeafStatic } from "@/components/ui/code-leaf-static"
import { CodeLineElementStatic } from "@/components/ui/code-line-element-static"
import { CodeSyntaxLeafStatic } from "@/components/ui/code-syntax-leaf-static"
import { ColumnElementStatic } from "@/components/ui/column-element-static"
import { ColumnGroupElementStatic } from "@/components/ui/column-group-element-static"
import { CommentLeafStatic } from "@/components/ui/comment-leaf-static"
import { DateElementStatic } from "@/components/ui/date-element-static"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { HeadingElementStatic } from "@/components/ui/heading-element-static"
import { HighlightLeafStatic } from "@/components/ui/highlight-leaf-static"
import { HrElementStatic } from "@/components/ui/hr-element-static"
import { ImageElementStatic } from "@/components/ui/image-element-static"
import { FireLiComponent, FireMarker } from "@/components/ui/indent-fire-marker"
import {
  TodoLiStatic,
  TodoMarkerStatic
} from "@/components/ui/indent-todo-marker-static"
import { KbdLeafStatic } from "@/components/ui/kbd-leaf-static"
import { LinkElementStatic } from "@/components/ui/link-element-static"
import { MediaAudioElementStatic } from "@/components/ui/media-audio-element-static"
import { MediaFileElementStatic } from "@/components/ui/media-file-element-static"
import { MediaVideoElementStatic } from "@/components/ui/media-video-element-static"
import { MentionElementStatic } from "@/components/ui/mention-element-static"
import { ParagraphElementStatic } from "@/components/ui/paragraph-element-static"
import {
  TableCellElementStatic,
  TableCellHeaderStaticElement
} from "@/components/ui/table-cell-element-static"
import { TableElementStatic } from "@/components/ui/table-element-static"
import { TableRowElementStatic } from "@/components/ui/table-row-element-static"
import { TocElementStatic } from "@/components/ui/toc-element-static"
import { ToggleElementStatic } from "@/components/ui/toggle-element-static"

import { EditorStatic } from "@/components/ui/editor-static"
import { EquationElementStatic } from "@/components/ui/equation-element-static"
import { InlineEquationElementStatic } from "@/components/ui/inline-equation-element-static"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useNote } from "@/hooks/use-note"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

const siteUrl = "https://platejs.org"
const lowlight = createLowlight(all)

export function ExportActionButton(props: DropdownMenuProps) {
  const t = useTranslations("Dashboard.Note.Header.NoteNavActions.Export")
  const { data: note } = useNote()
  const editor = useEditorRef()
  const [open, setOpen] = React.useState(false)
  const { resolvedTheme } = useTheme()

  const getThemeVars = (theme: string) => {
    if (theme === "dark") {
      return `
        --background: oklch(0.22 0 0);
        --foreground: oklch(0.89 0 0);
        --card: oklch(0.24 0 0);
        --card-foreground: oklch(0.89 0 0);
        --popover: oklch(0.24 0 0);
        --popover-foreground: oklch(0.89 0 0);
        --primary: oklch(0.71 0 0);
        --primary-foreground: oklch(0.22 0 0);
        --secondary: oklch(0.31 0 0);
        --secondary-foreground: oklch(0.89 0 0);
        --muted: oklch(0.29 0 0);
        --muted-foreground: oklch(0.6 0 0);
        --accent: oklch(0.37 0 0);
        --accent-foreground: oklch(0.89 0 0);
        --destructive: oklch(0.66 0.15 22.17);
        --border: oklch(0.33 0 0);
        --input: oklch(0.31 0 0);
        --ring: oklch(0.71 0 0);
        --font-sans: Inter, sans-serif;
        --font-mono: Fira Code, monospace;
        --font-serif: Georgia, serif;
      `
    }
    return `
      --background: oklch(0.96 0 0);
      --foreground: oklch(0.32 0 0);
      --card: oklch(0.97 0 0);
      --card-foreground: oklch(0.32 0 0);
      --popover: oklch(0.97 0 0);
      --popover-foreground: oklch(0.32 0 0);
      --primary: oklch(0.49 0 0);
      --primary-foreground: oklch(1 0 0);
      --secondary: oklch(0.91 0 0);
      --secondary-foreground: oklch(0.32 0 0);
      --muted: oklch(0.89 0 0);
      --muted-foreground: oklch(0.51 0 0);
      --accent: oklch(0.81 0 0);
      --accent-foreground: oklch(0.32 0 0);
      --destructive: oklch(0.56 0.19 25.86);
      --border: oklch(0.86 0 0);
      --input: oklch(0.91 0 0);
      --ring: oklch(0.49 0 0);
      --font-sans: Montserrat, sans-serif;
      --font-mono: Fira Code, monospace;
      --font-serif: Georgia, serif;
    `
  }

  const getNoiseBg = () => {
    return `background-image: url(https://tasklytic.fesyse.site/noise.png); background-size: 96px 96px; background-repeat: repeat;`
  }

  const getCanvas = async () => {
    const { default: html2canvas } = await import("html2canvas-pro")

    const style = document.createElement("style")
    document.head.append(style)

    const theme = resolvedTheme || "light"

    const canvas = await html2canvas(editor.api.toDOMNode(editor)!, {
      backgroundColor: theme === "dark" ? "#1b1b1b" : "#fff",
      onclone: (document: Document) => {
        const editorElement = document.querySelector('[contenteditable="true"]')
        if (editorElement) {
          Array.from(editorElement.querySelectorAll("*")).forEach((element) => {
            const existingStyle = element.getAttribute("style") || ""
            element.setAttribute(
              "style",
              `${existingStyle}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important`
            )
          })
        }
        document.documentElement.className = theme === "dark" ? "dark" : ""
        document.body.setAttribute(
          "style",
          `background: var(--background); color: var(--foreground); ${getNoiseBg()} ${getThemeVars(theme)}`
        )
        document.documentElement.setAttribute("style", getThemeVars(theme))
      }
    })
    style.remove()

    return canvas
  }

  const downloadFile = async (url: string, filename: string) => {
    const response = await fetch(url)

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = blobUrl
    link.download = filename
    document.body.append(link)
    link.click()
    link.remove()

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl)
  }

  const exportToPdf = async () => {
    if (!note) return

    const canvas = await getCanvas()

    const PDFLib = await import("pdf-lib")
    const pdfDoc = await PDFLib.PDFDocument.create()
    const page = pdfDoc.addPage([canvas.width, canvas.height])
    const imageEmbed = await pdfDoc.embedPng(canvas.toDataURL("PNG"))
    const { height, width } = imageEmbed.scale(1)
    page.drawImage(imageEmbed, {
      height,
      width,
      x: 0,
      y: 0
    })
    const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true })

    await downloadFile(pdfBase64, `${note.title}.pdf`)
  }

  const exportToImage = async () => {
    if (!note) return

    const canvas = await getCanvas()
    await downloadFile(canvas.toDataURL("image/png"), `${note.title}.png`)
  }

  const exportToHtml = async () => {
    if (!note) return
    const theme = resolvedTheme || "light"

    const components = {
      [BaseAudioPlugin.key]: MediaAudioElementStatic,
      [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
      [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: "strong" }),
      [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
      [BaseCodeLinePlugin.key]: CodeLineElementStatic,
      [BaseCodePlugin.key]: CodeLeafStatic,
      [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
      [BaseColumnItemPlugin.key]: ColumnElementStatic,
      [BaseColumnPlugin.key]: ColumnGroupElementStatic,
      [BaseCommentsPlugin.key]: CommentLeafStatic,
      [BaseDatePlugin.key]: DateElementStatic,
      [BaseEquationPlugin.key]: EquationElementStatic,
      [BaseFilePlugin.key]: MediaFileElementStatic,
      [BaseHighlightPlugin.key]: HighlightLeafStatic,
      [BaseHorizontalRulePlugin.key]: HrElementStatic,
      [BaseImagePlugin.key]: ImageElementStatic,
      [BaseInlineEquationPlugin.key]: InlineEquationElementStatic,
      [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: "em" }),
      [BaseKbdPlugin.key]: KbdLeafStatic,
      [BaseLinkPlugin.key]: LinkElementStatic,
      // [BaseMediaEmbedPlugin.key]: MediaEmbedElementStatic,
      [BaseMentionPlugin.key]: MentionElementStatic,
      [BaseParagraphPlugin.key]: ParagraphElementStatic,
      [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: "del" }),
      [BaseSubscriptPlugin.key]: withProps(SlateLeaf, { as: "sub" }),
      [BaseSuperscriptPlugin.key]: withProps(SlateLeaf, { as: "sup" }),
      [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
      [BaseTableCellPlugin.key]: TableCellElementStatic,
      [BaseTablePlugin.key]: TableElementStatic,
      [BaseTableRowPlugin.key]: TableRowElementStatic,
      [BaseTocPlugin.key]: TocElementStatic,
      [BaseTogglePlugin.key]: ToggleElementStatic,
      [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: "u" }),
      [BaseVideoPlugin.key]: MediaVideoElementStatic,
      [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: "h1" }),
      [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: "h2" }),
      [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: "h3" }),
      [HEADING_KEYS.h4]: withProps(HeadingElementStatic, { variant: "h4" }),
      [HEADING_KEYS.h5]: withProps(HeadingElementStatic, { variant: "h5" }),
      [HEADING_KEYS.h6]: withProps(HeadingElementStatic, { variant: "h6" })
    }

    const editorStatic = createSlateEditor({
      plugins: [
        BaseColumnPlugin,
        BaseColumnItemPlugin,
        BaseTocPlugin,
        BaseVideoPlugin,
        BaseAudioPlugin,
        BaseParagraphPlugin,
        BaseHeadingPlugin,
        BaseMediaEmbedPlugin,
        BaseBoldPlugin,
        BaseCodePlugin,
        BaseItalicPlugin,
        BaseStrikethroughPlugin,
        BaseSubscriptPlugin,
        BaseSuperscriptPlugin,
        BaseUnderlinePlugin,
        BaseBlockquotePlugin,
        BaseDatePlugin,
        BaseEquationPlugin,
        BaseInlineEquationPlugin,
        BaseCodeBlockPlugin.configure({
          options: {
            lowlight
          }
        }),
        BaseIndentPlugin.extend({
          inject: {
            targetPlugins: [
              BaseParagraphPlugin.key,
              BaseBlockquotePlugin.key,
              BaseCodeBlockPlugin.key
            ]
          }
        }),
        BaseIndentListPlugin.extend({
          inject: {
            targetPlugins: [
              BaseParagraphPlugin.key,
              ...HEADING_LEVELS,
              BaseBlockquotePlugin.key,
              BaseCodeBlockPlugin.key,
              BaseTogglePlugin.key
            ]
          },
          options: {
            listStyleTypes: {
              fire: {
                liComponent: FireLiComponent,
                markerComponent: FireMarker,
                type: "fire"
              },
              todo: {
                liComponent: TodoLiStatic,
                markerComponent: TodoMarkerStatic,
                type: "todo"
              }
            }
          }
        }),
        BaseLinkPlugin,
        BaseTableRowPlugin,
        BaseTablePlugin,
        BaseTableCellPlugin,
        BaseHorizontalRulePlugin,
        BaseFontColorPlugin,
        BaseFontBackgroundColorPlugin,
        BaseFontSizePlugin,
        BaseKbdPlugin,
        BaseAlignPlugin.extend({
          inject: {
            targetPlugins: [
              BaseParagraphPlugin.key,
              BaseMediaEmbedPlugin.key,
              ...HEADING_LEVELS,
              BaseImagePlugin.key
            ]
          }
        }),
        BaseLineHeightPlugin,
        BaseHighlightPlugin,
        BaseFilePlugin,
        BaseImagePlugin,
        BaseMentionPlugin,
        BaseCommentsPlugin,
        BaseTogglePlugin
      ],
      value: editor.children
    })

    const editorHtml = await serializeHtml(editorStatic, {
      components,
      editorComponent: EditorStatic,
      props: { style: { padding: "0 calc(50% - 350px)", paddingBottom: "" } }
    })

    const tailwindCss = `<link rel="stylesheet" href="${siteUrl}/tailwind.css">`
    const katexCss = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.css" integrity="sha384-9PvLvaiSKCPkFKB1ZsEoTjgnJn+O3KvEwtsz37/XrkYft3DTk2gHdYvd9oWgW3tV" crossorigin="anonymous">`

    const html = `<!DOCTYPE html>
    <html lang="en"${theme === "dark" ? ' class="dark"' : ""}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400..700&display=swap"
          rel="stylesheet"
        />
        ${tailwindCss}
        ${katexCss}
        <style>
          :root {${getThemeVars(theme)}}
          body { background: var(--background); color: var(--foreground); ${getNoiseBg()} }
        </style>
      </head>
      <body>
        ${editorHtml}
      </body>
    </html>`

    const url = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`

    await downloadFile(url, `${note.title}.html`)
  }

  const exportToMarkdown = async () => {
    if (!note) return

    const md = editor.getApi(MarkdownPlugin).markdown.serialize()
    const url = `data:text/markdown;charset=utf-8,${encodeURIComponent(md)}`
    await downloadFile(url, `${note.title}.md`)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
          <ArrowDownToLineIcon />
          <span>{t("export")}</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-4" onSelect={exportToHtml}>
            {t("html")}
            <CodeXml className="ml-auto" />
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-4" onSelect={exportToPdf}>
            {t("pdf")}
            <FileText className="ml-auto" />
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-4" onSelect={exportToImage}>
            {t("image")}
            <Image className="ml-auto" />
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-4" onSelect={exportToMarkdown}>
            {t("markdown")}
            <Heading1 className="ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

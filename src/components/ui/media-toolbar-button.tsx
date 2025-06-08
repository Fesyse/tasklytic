"use client"

import * as React from "react"

import { isUrl } from "@udecode/plate"
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  PlaceholderPlugin,
  VideoPlugin
} from "@udecode/plate-media/react"
import { useEditorRef } from "@udecode/plate/react"
import {
  AudioLinesIcon,
  FileUpIcon,
  FilmIcon,
  ImageIcon,
  LinkIcon
} from "lucide-react"
import { toast } from "sonner"
import { useFilePicker } from "use-file-picker"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

import { ToolbarButton } from "./toolbar"

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[]
    icon: React.ReactNode
    title: string
    tooltip: string
  }
> = {
  [AudioPlugin.key]: {
    accept: ["audio/*"],
    icon: <AudioLinesIcon className="size-4" />,
    title: "Insert Audio",
    tooltip: "Audio"
  },
  [FilePlugin.key]: {
    accept: ["*"],
    icon: <FileUpIcon className="size-4" />,
    title: "Insert File",
    tooltip: "File"
  },
  [ImagePlugin.key]: {
    accept: ["image/*"],
    icon: <ImageIcon className="size-4" />,
    title: "Insert Image",
    tooltip: "Image"
  },
  [VideoPlugin.key]: {
    accept: ["video/*"],
    icon: <FilmIcon className="size-4" />,
    title: "Insert Video",
    tooltip: "Video"
  }
}

export function MediaToolbarButtonTest() {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton>
          <ImageIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={10} alignOffset={-7}>
        <DropdownMenuGroup>
          {Object.entries(MEDIA_CONFIG).map(([nodeType, config]) => (
            <MediaToolbarButton config={config} nodeType={nodeType} />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MediaToolbarButton({
  config,
  nodeType
}: {
  config: (typeof MEDIA_CONFIG)[string]
  nodeType: string
}) {
  const editor = useEditorRef()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const { openFilePicker } = useFilePicker({
    accept: config.accept,
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      editor.getTransforms(PlaceholderPlugin).insert.media(updatedFiles)
    }
  })

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="gap-2">
          {config.icon} {config.title}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onPointerDown={(e) => e.preventDefault()}
              onSelect={(e) => {
                e.preventDefault()
                e.stopPropagation()
                openFilePicker()
              }}
            >
              {config.icon}
              Upload from computer
            </DropdownMenuItem>
            <DropdownMenuItem
              onPointerDown={(e) => e.preventDefault()}
              onSelect={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDialogOpen(true)
              }}
            >
              <LinkIcon />
              Insert via URL
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="gap-6">
          <MediaUrlDialogContent
            currentConfig={config}
            nodeType={nodeType}
            setOpen={setDialogOpen}
          />
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function MediaUrlDialogContent({
  currentConfig,
  nodeType,
  setOpen
}: {
  currentConfig: (typeof MEDIA_CONFIG)[string]
  nodeType: string
  setOpen: (value: boolean) => void
}) {
  const editor = useEditorRef()
  const [url, setUrl] = React.useState("")

  const embedMedia = React.useCallback(() => {
    if (!isUrl(url)) return toast.error("Invalid URL")

    setOpen(false)
    editor.tf.insertNodes({
      children: [{ text: "" }],
      name: nodeType === FilePlugin.key ? url.split("/").pop() : undefined,
      type: nodeType,
      url
    })
  }, [url, editor, nodeType, setOpen])

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{currentConfig.title}</AlertDialogTitle>
      </AlertDialogHeader>

      <AlertDialogDescription className="group relative w-full">
        <Input
          id="url"
          className="w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") embedMedia()
          }}
          placeholder="URL"
          type="url"
          autoFocus
        />
      </AlertDialogDescription>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={(e) => {
            e.preventDefault()
            embedMedia()
          }}
        >
          Accept
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}

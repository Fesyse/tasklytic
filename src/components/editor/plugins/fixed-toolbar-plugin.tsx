"use client"

import { createPlatePlugin } from "@udecode/plate-common/react"

import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar"
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons"
import { isCuid } from "@/lib/utils"
import { usePathname } from "next/navigation"

export const FixedToolbarPlugin = createPlatePlugin({
  key: "fixed-toolbar",
  render: {
    beforeEditable: ToolbarBeforeEditor
  }
})

function ToolbarBeforeEditor() {
  const pathname = usePathname()
  const splittedPathname = pathname
    .split("/")
    .slice(1, pathname.split("/").length)

  if (
    splittedPathname[0] === "projects" &&
    (splittedPathname[1] ? isCuid(splittedPathname[1]) : false) &&
    (splittedPathname[3] ? isCuid(splittedPathname[3]) : false)
  ) {
    return null
  }

  return (
    <FixedToolbar>
      <FixedToolbarButtons />
    </FixedToolbar>
  )
}

"use client"

import { createPlatePlugin } from "@udecode/plate-common/react"

import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar"
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons"
import { isCuid } from "@/lib/utils"
import { usePathname } from "next/navigation"

export const FixedToolbarPlugin = createPlatePlugin({
  key: "fixed-toolbar",
  render: {
    beforeEditable: () => {
      const pathname = usePathname()
      const splittedPathname = pathname
        .split("/")
        .slice(1, pathname.split("/").length)

      if (
        splittedPathname[0] === "projects" &&
        (splittedPathname[1] ? isCuid(splittedPathname[1]) : false) &&
        (splittedPathname[2] ? isCuid(splittedPathname[2]) : false)
      ) {
        return null
      }

      return (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      )
    }
  }
})

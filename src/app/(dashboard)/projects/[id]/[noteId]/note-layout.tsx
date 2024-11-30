"use client"

import { useCreateEditor } from "@/components/editor/use-create-editor"
import { DashboardBreadcrumbPage } from "@/components/layout/dashboard/breadcrumb-page"
import { NavActions } from "@/components/layout/dashboard/nav-actions"
import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar"
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Block } from "@/server/db/schema"
import { api } from "@/trpc/react"
import { ArgumentTypes } from "@/types/utils"
import { type TOperation } from "@udecode/plate-common"
import { Plate, type PlateStoreState } from "@udecode/plate-common/react"
import debounce from "lodash.debounce"
import { useParams } from "next/navigation"
import { useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

type NoteLayoutProps = React.PropsWithChildren<{
  blocks: Block[]
}>

export function NoteLayout({ blocks, children }: NoteLayoutProps) {
  const { id: projectId, noteId } = useParams<{ id: string; noteId: string }>()
  const { mutate: createBlock } = api.blocks.create.useMutation()
  const { mutate: updateOrder } = api.blocks.updateOrder.useMutation()
  const editor = useCreateEditor(blocks.map(b => b.content!))

  type HandleChangeOptions = ArgumentTypes<
    NonNullable<PlateStoreState<typeof editor>["onChange"]>
  >[0] & {
    /**
     * Plate.js operations is simply a state
     *
     * And it changes overtime
     *
     * That's why we need pass it to the function
     */
    operations: TOperation[]
  }

  const handleCreateBlock = useCallback(
    debounce(({ editor, value, operations }: HandleChangeOptions) => {
      console.log(operations)
      // const newBlock = value[value.length - 1]!
      // const id = "id" in newBlock ? (newBlock.id as string) : createCuid()

      // createBlock({
      //   id,
      //   noteId,
      //   content: newBlock,
      //   projectId,
      //   order: blocks.length
      // })
    }, 750),
    []
  )
  const handleUpdateOrder = useCallback(
    debounce(({ editor, value, operations }: HandleChangeOptions) => {
      const ids = value.map(b => b.id as string)

      // TODO: uncomment this after implement all other operations
      // updateOrder({
      //   noteId,
      //   ids
      // })
    }, 750),
    []
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate
        editor={editor}
        onChange={({ editor, value }) => {
          if (editor.operations.some(op => op.type === "split_node")) {
            handleCreateBlock({ editor, value, operations: editor.operations })
          }
          if (editor.operations.some(op => op.type === "move_node")) {
            handleUpdateOrder({ editor, value, operations: editor.operations })
          }
        }}
      >
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <DashboardBreadcrumbPage />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        <FixedToolbar className="px-3">
          <FixedToolbarButtons />
        </FixedToolbar>
        {children}
      </Plate>
    </DndProvider>
  )
}

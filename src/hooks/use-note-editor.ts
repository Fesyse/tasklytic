import { useCreateEditor } from "@/components/editor/use-create-editor"
import { type Block, createCuid } from "@/server/db/schema"
import { api } from "@/trpc/react"
import type { ArgumentTypes } from "@/types/utils"
import type { TElement, TOperation } from "@udecode/plate-common"
import type { PlateStoreState } from "@udecode/plate-common/react"
import debounce from "lodash.debounce"
import { useParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

type UseNoteEditorProps = {
  blocks: Block[]
}

const DEBOUNCE_DELAY = 750

export const useNoteEditor = ({ blocks }: UseNoteEditorProps) => {
  const { id: projectId, noteId } = useParams<{
    id: string
    noteId: string
  }>()
  const { mutate: createBlock } = api.blocks.create.useMutation()
  const { mutate: updateBlockContent } = api.blocks.updateContent.useMutation()
  const { mutate: updateBlockOrder } = api.blocks.updateOrder.useMutation()
  const { mutate: deleteBlocks } = api.blocks.deleteMany.useMutation()

  const editor = useCreateEditor(blocks.map(b => b.content!))
  /* Dont use currentBlock outside of a operation handlers! */
  const [currentBlock, setCurrentBlock] = useState<TElement | undefined>(
    editor.children[0]
  )
  const [deletingBlockIds, setDeletingBlockIds] = useState<string[]>([])

  type HandleChangeOptions = ArgumentTypes<
    NonNullable<PlateStoreState<typeof editor>["onChange"]>
  >[0] & {
    /**
     * **Plate.js** operations is simply a **state**, that's why we need pass it to the function, rather than getting from `editor`
     */
    operations: TOperation[]
    currentBlock: TElement | undefined
  }

  const handleCreateBlock = useCallback(
    debounce(({ editor, value, operations }: HandleChangeOptions) => {
      const newBlock = value[value.length - 1]!
      const id = "id" in newBlock ? (newBlock.id as string) : createCuid()

      setCurrentBlock(newBlock)
      createBlock({
        id,
        noteId,
        content: newBlock,
        projectId,
        order: blocks.length
      })
    }, DEBOUNCE_DELAY),
    []
  )
  const handleUpdateOrder = useCallback(
    debounce(({ editor, value, operations }: HandleChangeOptions) => {
      const ids = value.map(b => b.id as string)

      // TODO: uncomment this after implement all other operations
      // updateBlockOrder({
      //   noteId,
      //   ids
      // })
    }, DEBOUNCE_DELAY),
    []
  )
  const handleUpdateBlock = useCallback(
    debounce(
      async ({
        editor,
        value,
        operations,
        currentBlock
      }: HandleChangeOptions) => {
        if (!currentBlock) return

        const order = blocks.findIndex(b => b.id === currentBlock.id)

        updateBlockContent({
          id: currentBlock.id as string,
          content: {
            ...currentBlock,
            ...value.find(b => b.id === currentBlock.id)!
          },
          order: order === -1 ? 0 : order,
          noteId,
          projectId
        })
      },
      DEBOUNCE_DELAY
    ),
    []
  )
  const handleDeleteBlock = useCallback(
    debounce(
      ({
        deletingBlockIds
      }: HandleChangeOptions & { deletingBlockIds: string[] }) => {
        deleteBlocks({ ids: deletingBlockIds, noteId, projectId })
      },
      DEBOUNCE_DELAY
    ),
    []
  )
  const handleSelection = useCallback(
    ({ value, operations }: HandleChangeOptions) => {
      const operation = operations.find(op => op.type === "set_selection")

      if (
        !operation ||
        !operation.newProperties ||
        !operation.newProperties.anchor
      )
        return

      setCurrentBlock(value[operation.newProperties.anchor.path[0]!])
    },
    []
  )

  const deleteBlock = useCallback(
    (options: HandleChangeOptions) => {
      const { editor } = options

      const operation = editor.operations.find(
        op => op.type === "remove_node" || op.type === "merge_node"
      )
      if (!operation || !operation.properties) return

      const id = (
        operation.properties as { id: string; type: TOperation["type"] }
      ).id
      setDeletingBlockIds(deletingBlockIds => {
        const newDeletingBlockIds = [...deletingBlockIds, id]
        handleDeleteBlock({
          ...options,
          deletingBlockIds: newDeletingBlockIds
        })

        return newDeletingBlockIds
      })
    },
    [setDeletingBlockIds, handleDeleteBlock]
  )

  const handlers: Record<
    TOperation["type"],
    (options: HandleChangeOptions) => void
  > = useMemo(
    () => ({
      insert_node: handleUpdateBlock,
      merge_node: deleteBlock,
      set_node: handleUpdateBlock,
      set_selection: handleSelection,
      remove_text: handleUpdateBlock,
      insert_text: handleUpdateBlock,
      remove_node: deleteBlock,
      move_node: handleUpdateOrder,
      split_node: ({ editor, value, operations, currentBlock }) => {
        const newBlock = value[value.length - 1]!

        setCurrentBlock(newBlock)
        handleCreateBlock({ editor, value, operations, currentBlock })
      }
    }),
    []
  )

  const handleChange = ({
    editor,
    value
  }: Omit<HandleChangeOptions, "operations" | "currentBlock">) => {
    const operations = editor.operations.filter(
      (value, index, self) =>
        index === self.findIndex(t => t.type === value.type)
    )

    for (const operation of operations) {
      const handler = handlers[operation.type]

      if (handler) handler({ editor, value, operations, currentBlock })
    }
  }

  return {
    editor,
    handleChange
  }
}

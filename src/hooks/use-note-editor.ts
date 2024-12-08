import { useCreateEditor } from "@/components/editor/use-create-editor"
import { type Block } from "@/server/db/schema"
import { api } from "@/trpc/react"
import type { ArgumentTypes } from "@/types/utils"
import type {
  TElement,
  TOperation,
  TSelectionOperation
} from "@udecode/plate-common"
import type { PlateStoreState } from "@udecode/plate-common/react"
import debounce from "lodash.debounce"
import { useParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

type UseNoteEditorProps = {
  blocks: Block[]
}

const DEBOUNCE_DELAY = 2000

const getIdFromOperation = (
  operation: TOperation,
  value: TElement[]
): string | undefined => {
  switch (operation.type) {
    case "insert_node":
      return value[operation.path[0]!]!.id as string
    case "insert_text":
      return value[operation.path[0]!]!.id as string
    case "merge_node":
      if ("id" in operation.properties) {
        return (operation.properties as { id: string; type: TElement["type"] })
          .id
      }
      return value[operation.path[0]!]!.id as string
    case "move_node":
      return value[operation.newPath[0]!]!.id as string
    case "remove_node":
      const block = value[operation.path[0]!]
      if (!block) return operation.node.id as string

      return block.id as string
    case "remove_text":
      return value[operation.path[0]!]!.id as string
    case "set_node":
      return value[operation.path[0]!]!.id as string
    case "set_selection":
      return value[operation.properties!.anchor!.path[0]!]!.id as string
    case "split_node":
      return value[operation.path[0]!]!.id as string
    default:
      return undefined
  }
}

export const useNoteEditor = ({ blocks }: UseNoteEditorProps) => {
  const { id: projectId, noteId } = useParams<{
    id: string
    noteId: string
  }>()
  const { mutate: updateOrCreateBlock } =
    api.blocks.updateOrCreateBlock.useMutation()
  const { mutate: updateBlockOrder } = api.blocks.updateOrder.useMutation()
  const { mutate: deleteBlocks } = api.blocks.deleteMany.useMutation()

  const editor = useCreateEditor(blocks.map(b => b.content!))
  /* Dont use currentBlock outside of a operation handlers! */
  const [currentBlock, setCurrentBlock] = useState<TElement | undefined>(
    editor.children[0]
  )
  const [deletingBlockIds, setDeletingBlockIds] = useState<string[]>([])
  const [updatingBlockIds, setUpdatingBlockIds] = useState<string[]>([])

  type HandleChangeOptions = ArgumentTypes<
    NonNullable<PlateStoreState<typeof editor>["onChange"]>
  >[0] & {
    operation: TOperation
    currentBlock: TElement | undefined
  }

  const handleUpdateOrder = useCallback(
    debounce(({ value }: HandleChangeOptions) => {
      const ids = value.map(b => b.id as string)

      updateBlockOrder({
        noteId,
        ids
      })
    }, DEBOUNCE_DELAY),
    []
  )
  const debouncedUpdateOrCreateBlocks = useCallback(
    debounce(
      async ({
        value,
        updatingBlockIds
      }: HandleChangeOptions & { updatingBlockIds: string[] }) => {
        if (!updatingBlockIds.length) return

        updateOrCreateBlock({
          blocks: updatingBlockIds
            .filter(id => value.findIndex(b => (b.id as string) === id) !== -1)
            .map(id => ({
              id,
              content: value.find(b => (b.id as string) === id)!,
              order: value.findIndex(b => (b.id as string) === id)
            })),
          noteId,
          projectId
        })

        setUpdatingBlockIds([])
      },
      DEBOUNCE_DELAY
    ),
    []
  )
  const handleUpdateOrCreateBlocks = useCallback(
    (options: HandleChangeOptions) => {
      const { value, operation } = options

      const id = getIdFromOperation(operation, value)
      if (!id) throw new Error("No id found")

      setUpdatingBlockIds(updatingBlockIds => {
        const newUpdatingBlockIds = Array.from(
          new Set([...updatingBlockIds, id])
        ).filter(
          updatingId =>
            deletingBlockIds.findIndex(id => id === updatingId) === -1
        )
        debouncedUpdateOrCreateBlocks({
          ...options,
          operation,
          updatingBlockIds: newUpdatingBlockIds
        })
        return newUpdatingBlockIds
      })
    },
    [setUpdatingBlockIds, debouncedUpdateOrCreateBlocks]
  )

  const debouncedDeleteBlocks = useCallback(
    debounce(
      ({
        deletingBlockIds
      }: HandleChangeOptions & { deletingBlockIds: string[] }) => {
        deleteBlocks({ ids: deletingBlockIds, noteId, projectId })

        setDeletingBlockIds([])
      },
      DEBOUNCE_DELAY
    ),
    []
  )
  const handleSelection = useCallback(
    ({ value, ...options }: HandleChangeOptions) => {
      const operation = options.operation as TSelectionOperation

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

  const handleDeleteBlocks = useCallback(
    (options: HandleChangeOptions) => {
      const { operation, value } = options

      const id = getIdFromOperation(operation, value)
      console.log(operation)

      if (!id) throw new Error("No id found")

      setDeletingBlockIds(deletingBlockIds => {
        const newDeletingBlockIds = Array.from(
          new Set([...deletingBlockIds, id])
        )
        debouncedDeleteBlocks({
          ...options,
          deletingBlockIds: newDeletingBlockIds
        })

        return newDeletingBlockIds
      })
    },
    [setDeletingBlockIds, debouncedDeleteBlocks]
  )

  const handlers: Record<
    TOperation["type"],
    (options: HandleChangeOptions) => void
  > = useMemo(
    () => ({
      set_selection: handleSelection,
      split_node: ({ editor, value, operation, currentBlock }) => {
        const id = (
          operation.properties as { id: string; type: TOperation["type"] }
        ).id
        const newBlock = value.find(b => (b.id as string) === id)

        setCurrentBlock(newBlock)
        handleUpdateOrCreateBlocks({ editor, value, operation, currentBlock })
      },
      insert_node: handleUpdateOrCreateBlocks,
      set_node: handleUpdateOrCreateBlocks,
      remove_text: handleUpdateOrCreateBlocks,
      insert_text: handleUpdateOrCreateBlocks,
      move_node: handleUpdateOrder,
      merge_node: handleDeleteBlocks,
      remove_node: handleDeleteBlocks
    }),
    []
  )

  const handleChange = ({
    editor,
    value
  }: Omit<HandleChangeOptions, "operation" | "currentBlock">) => {
    for (const operation of editor.operations) {
      const handler = handlers[operation.type]

      if (handler) handler({ editor, value, operation, currentBlock })
    }
  }

  return {
    editor,
    handleChange
  }
}
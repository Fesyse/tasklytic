import type {
  TElement,
  TOperation,
  TSelectionOperation
} from "@udecode/plate-common"
import type { PlateStoreState } from "@udecode/plate-common/react"
import debounce from "lodash.debounce"
import { useParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { useCreateEditor } from "@/components/editor/use-create-editor"
import { useNoteEditorState } from "@/components/providers/note-editor-state-provider"
import type { ArgumentTypes } from "@/types/utils"
import { useSubscribeToEvent } from "@/lib/pusher"
import { type Block } from "@/server/db/schema"
import { api } from "@/trpc/react"

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
  useSubscribeToEvent("update", console.log)
  const { setState: setNoteEditorState } = useNoteEditorState(s => s)

  const { projectId, noteId } = useParams<{
    projectId: string
    noteId: string
  }>()

  const setSavedOnSuccess = () => setNoteEditorState({ saved: true })

  // Mutations for blocks
  const { mutate: updateOrCreateBlocks } =
    api.blocks.updateOrCreateBlocks.useMutation({
      onSuccess: setSavedOnSuccess
    })
  const { mutate: updateBlockOrder } = api.blocks.updateOrder.useMutation({
    onSuccess: setSavedOnSuccess
  })
  const { mutate: deleteBlocks } = api.blocks.deleteMany.useMutation({
    onSuccess: setSavedOnSuccess
  })

  const editor = useCreateEditor(blocks.map(b => b.content!))
  /* Dont use currentBlock outside of a operation handlers! */
  const [currentBlock, setCurrentBlock] = useState<TElement | undefined>(
    editor.children[0]
  )

  const [deletingBlockIds, setDeletingBlockIds] = useState<string[]>([])
  const [_updatingBlockIds, setUpdatingBlockIds] = useState<string[]>([])

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
        projectId,
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

        updateOrCreateBlocks({
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

  const handleChange = useCallback(
    ({
      editor,
      value
    }: Omit<HandleChangeOptions, "operation" | "currentBlock">) => {
      setNoteEditorState({ saved: false })

      for (const operation of editor.operations) {
        // in order to get and process all blocks we need to use the operation from plate.js, so we use handlers for that
        const handler = handlers[operation.type]

        handler({ editor, value, operation, currentBlock })
      }
    },
    []
  )

  return {
    editor,
    handleChange
  }
}

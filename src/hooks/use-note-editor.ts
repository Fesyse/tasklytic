import { useCreateEditor } from "@/components/editor/use-create-editor"
import { Block, createCuid } from "@/server/db/schema"
import { api } from "@/trpc/react"
import { ArgumentTypes } from "@/types/utils"
import type { TElement, TOperation } from "@udecode/plate-common"
import { PlateStoreState } from "@udecode/plate-common/react"
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
  const { mutate: updateOrder } = api.blocks.updateOrder.useMutation()
  const editor = useCreateEditor(blocks.map(b => b.content!))

  const [currentBlock, setCurrentBlock] = useState<TElement>()

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
      // updateOrder({
      //   noteId,
      //   ids
      // })
    }, DEBOUNCE_DELAY),
    []
  )
  const handleUpdateBlock = useCallback(
    debounce(({ editor, value, operations }: HandleChangeOptions) => {
      // console.log(editor, value, operations)
    }, DEBOUNCE_DELAY),
    []
  )
  const handleDeleteBlock = useCallback(
    debounce(
      ({ editor, value, operations }: HandleChangeOptions) => {},
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

  const handlers: Record<
    TOperation["type"],
    (options: HandleChangeOptions) => void
  > = useMemo(
    () => ({
      insert_node: () => {},
      merge_node: () => {},
      set_node: () => {},
      set_selection: handleSelection,
      remove_text: handleUpdateBlock,
      insert_text: handleUpdateBlock,
      remove_node: handleDeleteBlock,
      move_node: handleUpdateOrder,
      split_node: ({ editor, value, operations }) => {
        const newBlock = value[value.length - 1]!

        setCurrentBlock(newBlock)
        handleCreateBlock({ editor, value, operations })
      }
    }),
    []
  )

  const handleChange = ({
    editor,
    value
  }: Omit<HandleChangeOptions, "operations">) => {
    for (const operation of editor.operations) {
      const handler = handlers[operation.type]

      if (handler) handler({ editor, value, operations: editor.operations })
    }
  }

  return {
    editor,
    handleChange
  }
}

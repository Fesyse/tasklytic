"use client"

import { type TElement } from "@udecode/plate-common"
import { Plate } from "@udecode/plate-common/react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useCreateEditor } from "@/components/editor/use-create-editor"
import { Editor, EditorContainer } from "@/components/plate-ui/editor"

type PlateEditorProps = {
  value?: TElement[]
}

export function PlateEditor({ value }: PlateEditorProps) {
  const editor = useCreateEditor(value)

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </Plate>
    </DndProvider>
  )
}

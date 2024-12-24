import { type FC } from "react"
import { Editor, EditorContainer } from "@/components/plate-ui/editor"
import { cn } from "@/lib/utils"

type NoteProps = {
  className?: string
}

export const Note: FC<NoteProps> = ({ className }) => {
  return (
    <div className={cn("h-screen w-full", className)} data-registry="plate">
      <EditorContainer>
        <Editor variant="default" />
      </EditorContainer>
    </div>
  )
}

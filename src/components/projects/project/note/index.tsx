"use client"

import { type Block } from "@/server/db/schema"
import { useCallback, useState, type FC } from "react"
import { createEditor } from "slate"
import {
  Editable,
  Slate,
  withReact,
  type RenderElementProps
} from "slate-react"

type NoteProps = {
  blocks: Block[]
  className?: string
}

export const Note: FC<NoteProps> = ({ className, blocks }) => {
  const [editor] = useState(() => withReact(createEditor()))

  const renderElement = useCallback((props: RenderElementProps) => {
    console.log(props)

    return <div></div>
  }, [])

  return (
    <div className={className}>
      <Slate
        editor={editor}
        initialValue={[
          {
            children: [{ text: "Hello World" }]
          }
        ]}
        onChange={console.log}
      >
        <Editable
          className="outline-none"
          renderElement={renderElement}
          placeholder="Your content here..."
        />
      </Slate>
    </div>
  )
}

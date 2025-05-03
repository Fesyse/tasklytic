import type { ReactNode } from "react"
import { DraggedTodoContext, useDraggedTodoState } from "./useDraggedTodo"

interface DraggedTodoProviderProps {
  children: ReactNode
}

export function DraggedTodoProvider({ children }: DraggedTodoProviderProps) {
  const draggedTodoState = useDraggedTodoState()

  return (
    <DraggedTodoContext.Provider value={draggedTodoState}>
      {children}
    </DraggedTodoContext.Provider>
  )
}

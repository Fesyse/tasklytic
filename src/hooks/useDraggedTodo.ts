import type { TodoStatus } from "@/server/db/schema"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useDebounce } from "./useDebounce"

type DraggedTodoState = {
  id: string | null
  originalStatus: TodoStatus | null
  currentStatus: TodoStatus | null
}

type DraggedTodoContextType = {
  draggedTodo: DraggedTodoState
  startDrag: (id: string, status: TodoStatus) => void
  updateDragStatus: (status: TodoStatus) => void
  endDrag: () => DraggedTodoState | null
  resetDrag: () => void
}

// Create context
export const DraggedTodoContext = createContext<DraggedTodoContextType | null>(
  null
)

// Initial state
const initialDragState: DraggedTodoState = {
  id: null,
  originalStatus: null,
  currentStatus: null
}

// Hook to create the context value
export function useDraggedTodoState(): DraggedTodoContextType {
  const [draggedTodo, setDraggedTodo] =
    useState<DraggedTodoState>(initialDragState)

  // Store pending status updates and execute with debounce
  const [pendingStatus, setPendingStatus] = useState<TodoStatus | null>(null)
  const debouncedStatus = useDebounce(pendingStatus, 50)

  // Store original state for reference
  const originalStateRef = useRef<DraggedTodoState>(initialDragState)

  // Apply the debounced status
  useEffect(() => {
    if (debouncedStatus && draggedTodo.id) {
      setDraggedTodo((prev) => ({
        ...prev,
        currentStatus: debouncedStatus
      }))
    }
  }, [debouncedStatus, draggedTodo.id])

  const startDrag = (id: string, status: TodoStatus) => {
    const newState = {
      id,
      originalStatus: status,
      currentStatus: status
    }
    setDraggedTodo(newState)
    originalStateRef.current = newState
    setPendingStatus(status)
  }

  const updateDragStatus = (status: TodoStatus) => {
    if (!draggedTodo.id) return
    // Only update if the new status is different
    if (status !== draggedTodo.currentStatus) {
      setPendingStatus(status)
    }
  }

  const endDrag = () => {
    // Return the final state before resetting
    const finalState = { ...draggedTodo }

    // Only return if there was a change in status
    if (
      finalState.id &&
      finalState.originalStatus &&
      finalState.currentStatus &&
      finalState.originalStatus !== finalState.currentStatus
    ) {
      resetDrag()
      return finalState
    }

    resetDrag()
    return null
  }

  const resetDrag = () => {
    setDraggedTodo(initialDragState)
    setPendingStatus(null)
    originalStateRef.current = initialDragState
  }

  return {
    draggedTodo,
    startDrag,
    updateDragStatus,
    endDrag,
    resetDrag
  }
}

// Hook to use the context
export function useDraggedTodo(): DraggedTodoContextType {
  const context = useContext(DraggedTodoContext)
  if (!context) {
    throw new Error("useDraggedTodo must be used within a DraggedTodoProvider")
  }
  return context
}

import { TodoItem } from "@/components/todo-item"
import { useDraggedTodo } from "@/hooks/useDraggedTodo"
import { cn } from "@/lib/utils"
import type { TodoStatus, TodoWithSubTodos } from "@/server/db/schema"
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"

// Simple throttle function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

type KanbanColumnProps = {
  id: TodoStatus
  title: string
  todos: TodoWithSubTodos[]
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TodoStatus) => void
  onAddSubTodo?: (todoId: string, title: string, status?: TodoStatus) => void
  onUpdateSubTodo?: (
    id: string,
    updates: { title?: string; status?: TodoStatus }
  ) => void
  onDeleteSubTodo?: (id: string) => void
  className?: string
}

function KanbanColumn({
  id,
  title,
  todos,
  onDelete,
  onStatusChange,
  onAddSubTodo,
  onUpdateSubTodo,
  onDeleteSubTodo,
  className
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "column",
      status: id
    }
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-muted/20 flex h-full flex-col rounded-lg border p-4",
        isOver && "bg-muted/40 border-dashed", // Visual feedback when dragging over
        className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div
        className="min-h-[200px] flex-1 space-y-4 overflow-auto"
        data-column-id={id}
      >
        <SortableContext
          id={id}
          items={todos.map((todo) => todo.id)}
          strategy={rectSortingStrategy}
        >
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onAddSubTodo={onAddSubTodo}
              onUpdateSubTodo={onUpdateSubTodo}
              onDeleteSubTodo={onDeleteSubTodo}
              isDraggable
            />
          ))}
        </SortableContext>
        {todos.length === 0 && (
          <div className="text-muted-foreground flex h-20 items-center justify-center rounded-lg border border-dashed text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}

type TodoKanbanProps = {
  todos: TodoWithSubTodos[]
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TodoStatus) => void
  onAddSubTodo?: (todoId: string, title: string, status?: TodoStatus) => void
  onUpdateSubTodo?: (
    id: string,
    updates: { title?: string; status?: TodoStatus }
  ) => void
  onDeleteSubTodo?: (id: string) => void
}

interface TodoWithDisplayStatus extends TodoWithSubTodos {
  _displayStatus?: TodoStatus
}

export function TodoKanban({
  todos,
  onDelete,
  onStatusChange,
  onAddSubTodo,
  onUpdateSubTodo,
  onDeleteSubTodo
}: TodoKanbanProps) {
  const [activeTodo, setActiveTodo] = useState<TodoWithSubTodos | null>(null)
  const { startDrag, updateDragStatus, endDrag, draggedTodo } = useDraggedTodo()

  // Create a modified todos array with display status
  const [displayTodos, setDisplayTodos] = useState<TodoWithDisplayStatus[]>([])

  // Update display todos when real todos or dragged state changes
  useEffect(() => {
    setDisplayTodos(
      todos.map((todo) => {
        if (draggedTodo.id === todo.id && draggedTodo.currentStatus) {
          return {
            ...todo,
            _displayStatus: draggedTodo.currentStatus
          }
        }
        return todo
      })
    )
  }, [todos, draggedTodo])

  // Create a stable throttled update function reference
  const throttledUpdate = useCallback(
    throttle((status: TodoStatus) => {
      updateDragStatus(status)
    }, 100),
    [updateDragStatus]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  // Filter todos by their current status or by their temporary drag status
  const getFilteredTodos = useCallback(
    (status: TodoStatus) => {
      return displayTodos.filter((todo) => {
        const effectiveStatus = todo._displayStatus || todo.status
        return effectiveStatus === status
      })
    },
    [displayTodos]
  )

  const plannedTodos = getFilteredTodos("planned")
  const inProgressTodos = getFilteredTodos("in-progress")
  const completedTodos = getFilteredTodos("completed")

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedTodo = todos.find((todo) => todo.id === active.id)

    if (draggedTodo) {
      setActiveTodo(draggedTodo)
      // Initialize drag tracking with the current todo and its status
      startDrag(draggedTodo.id, draggedTodo.status)
    }
  }

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      const activeTodo = todos.find((todo) => todo.id === activeId)
      if (!activeTodo) return

      const isColumn = over.data.current?.type === "column"

      if (isColumn) {
        const columnStatus = over.data.current?.status as TodoStatus
        // Use the throttled update function
        throttledUpdate(columnStatus)
        return
      }

      const overTodo = todos.find((todo) => todo.id === overId)
      if (overTodo) {
        // Use the throttled update function
        throttledUpdate(overTodo.status)
      }
    },
    [todos, throttledUpdate]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTodo(null)
      // Reset drag state without making any changes
      endDrag()
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Determine final status based on drop target
    let finalStatus: TodoStatus | null = null

    // Check if dropped on a column
    if (over.data.current?.type === "column") {
      finalStatus = over.data.current.status as TodoStatus
    } else {
      // If dropped on another todo, find that todo and use its status
      const overTodo = todos.find((todo) => todo.id === overId)
      if (overTodo) {
        finalStatus = overTodo.status
      }
    }

    // Get the drag state and finalize the operation
    const dragResult = endDrag()

    // Only call the status change if there was a real change
    if (dragResult && dragResult.id && finalStatus) {
      onStatusChange(dragResult.id, finalStatus)
    }

    setActiveTodo(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4">
        <KanbanColumn
          id="planned"
          title="Planned"
          todos={plannedTodos}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onAddSubTodo={onAddSubTodo}
          onUpdateSubTodo={onUpdateSubTodo}
          onDeleteSubTodo={onDeleteSubTodo}
        />
        <KanbanColumn
          id="in-progress"
          title="In Progress"
          todos={inProgressTodos}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onAddSubTodo={onAddSubTodo}
          onUpdateSubTodo={onUpdateSubTodo}
          onDeleteSubTodo={onDeleteSubTodo}
        />
        <KanbanColumn
          id="completed"
          title="Completed"
          todos={completedTodos}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onAddSubTodo={onAddSubTodo}
          onUpdateSubTodo={onUpdateSubTodo}
          onDeleteSubTodo={onDeleteSubTodo}
        />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeTodo ? (
              <div className="w-full max-w-md opacity-80">
                <TodoItem
                  todo={activeTodo}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onAddSubTodo={onAddSubTodo}
                  onUpdateSubTodo={onUpdateSubTodo}
                  onDeleteSubTodo={onDeleteSubTodo}
                  isDraggable={false}
                />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}

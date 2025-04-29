import { TodoItem } from "@/components/todo-item"
import type { Todo, TodoStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { useState } from "react"
import { createPortal } from "react-dom"

interface KanbanColumnProps {
  id: TodoStatus
  title: string
  todos: Todo[]
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Todo["status"]) => void
  className?: string
}

function KanbanColumn({
  id,
  title,
  todos,
  onDelete,
  onStatusChange,
  className
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "bg-muted/20 flex h-full flex-col rounded-lg border p-4",
        className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div
        className="min-h-[200px] flex-1 space-y-4 overflow-auto"
        data-column-id={id}
      >
        <SortableContext
          items={todos.map((todo) => todo.id)}
          strategy={rectSortingStrategy}
        >
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
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

interface TodoKanbanProps {
  todos: Todo[]
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Todo["status"]) => void
}

export function TodoKanban({
  todos,
  onDelete,
  onStatusChange
}: TodoKanbanProps) {
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  const plannedTodos = todos.filter((todo) => todo.status === "planned")
  const inProgressTodos = todos.filter((todo) => todo.status === "in-progress")
  const completedTodos = todos.filter((todo) => todo.status === "completed")

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedTodo = todos.find((todo) => todo.id === active.id)
    if (draggedTodo) {
      setActiveTodo(draggedTodo)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    // If not dropping over anything or the same status, do nothing
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active todo being dragged
    const activeTodo = todos.find((todo) => todo.id === activeId)
    if (!activeTodo) return

    // Handle dropping onto another todo
    const overTodo = todos.find((todo) => todo.id === overId)
    if (overTodo) {
      // If dragging onto another todo, use that todo's status
      if (activeTodo.status !== overTodo.status) {
        onStatusChange(activeId, overTodo.status)
      }
      return
    }

    // Handle dropping onto a column
    const overColumn = over.data.current?.columnId || over.id
    if (typeof overColumn === "string" && overColumn !== activeTodo.status) {
      // Valid column statuses are "planned", "in-progress", or "completed"
      if (["planned", "in-progress", "completed"].includes(overColumn)) {
        onStatusChange(activeId, overColumn as TodoStatus)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // If not dropping over anything, do nothing
    if (!over) {
      setActiveTodo(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Find the column we're dropping onto (if applicable)
    if (
      overId === "planned" ||
      overId === "in-progress" ||
      overId === "completed"
    ) {
      onStatusChange(activeId, overId as TodoStatus)
    }

    // Find the element we're dropping onto by looking at its data attributes
    if (event.activatorEvent instanceof MouseEvent) {
      const overElement = document.elementFromPoint(
        event.activatorEvent.clientX,
        event.activatorEvent.clientY
      )
      const columnEl = overElement?.closest("[data-column-id]")
      const columnId = columnEl?.getAttribute("data-column-id")

      if (
        columnId &&
        ["planned", "in-progress", "completed"].includes(columnId)
      ) {
        onStatusChange(activeId, columnId as TodoStatus)
      }
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
      <div className="grid h-[calc(100vh-12rem)] grid-cols-3 gap-4">
        <KanbanColumn
          id="planned"
          title="Planned"
          todos={plannedTodos}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
        <KanbanColumn
          id="in-progress"
          title="In Progress"
          todos={inProgressTodos}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
        <KanbanColumn
          id="completed"
          title="Completed"
          todos={completedTodos}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
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

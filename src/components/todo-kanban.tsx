import { TodoItem } from "@/components/todo-item"
import type { Todo, TodoStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
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
import { useState } from "react"
import { createPortal } from "react-dom"

type KanbanColumnProps = {
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

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTodo = todos.find((todo) => todo.id === activeId)
    if (!activeTodo) return

    const isColumn = over.data.current?.type === "column"

    if (isColumn) {
      const columnStatus = over.data.current?.status as TodoStatus
      if (activeTodo.status !== columnStatus) {
        onStatusChange(activeId, columnStatus)
      }
      return
    }

    const overTodo = todos.find((todo) => todo.id === overId)
    if (overTodo && activeTodo.status !== overTodo.status) {
      onStatusChange(activeId, overTodo.status)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTodo(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    console.log("DragEnd - Active ID:", activeId, "Over ID:", overId)
    console.log("Over data:", over.data.current)

    // Check if dropped on a column
    if (over.data.current?.type === "column") {
      const columnStatus = over.data.current.status as TodoStatus
      console.log("Dropping onto column:", columnStatus)
      onStatusChange(activeId, columnStatus)
    } else {
      // If dropped on another todo, find that todo and use its status
      const overTodo = todos.find((todo) => todo.id === overId)
      if (overTodo) {
        console.log("Dropping onto todo with status:", overTodo.status)
        onStatusChange(activeId, overTodo.status)
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
      <div className="grid grid-cols-3 gap-4">
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

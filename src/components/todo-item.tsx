import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { SubTodo, Todo } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  Trash
} from "lucide-react"
import { useState } from "react"

interface TodoItemProps {
  todo: Todo
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Todo["status"]) => void
  isDraggable?: boolean
}

export function TodoItem({
  todo,
  onDelete,
  onStatusChange,
  isDraggable = false
}: TodoItemProps) {
  const [expanded, setExpanded] = useState(false)

  // Set up sortable functionality if this item is draggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = isDraggable
    ? useSortable({ id: todo.id })
    : {
        attributes: {},
        listeners: {},
        setNodeRef: () => {},
        transform: null,
        transition: null,
        isDragging: false
      }

  // Set up the styles for the draggable item
  const style =
    isDraggable && transform
      ? {
          transform: CSS.Transform.toString(transform),
          transition: transition as string,
          opacity: isDragging ? 0.5 : 1
        }
      : undefined

  const statusColors = {
    planned: "bg-blue-100 text-blue-800",
    "in-progress": "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800"
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(date))
  }

  return (
    <Card
      className={cn("mb-3 p-4")}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          {isDraggable && (
            <button
              className={cn(
                "text-muted-foreground mt-1 h-5 w-5 flex-shrink-0",
                { "cursor-grab active:cursor-grabbing": isDraggable }
              )}
              {...listeners}
            >
              <GripVertical size={20} />
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 h-5 w-5 flex-shrink-0"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {todo.subTodos.length > 0 &&
              (expanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              ))}
          </button>

          <div>
            <div className="flex items-center gap-2">
              {todo.emoji && <span className="text-lg">{todo.emoji}</span>}
              <h3 className="font-semibold">{todo.title}</h3>
              <Badge className={cn(statusColors[todo.status])}>
                {todo.status.charAt(0).toUpperCase() +
                  todo.status.slice(1).replace("-", " ")}
              </Badge>
            </div>

            <div className="text-muted-foreground mt-1 text-sm">
              {formatDate(todo.startDate)}
              {todo.endDate && ` - ${formatDate(todo.endDate)}`}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onStatusChange(todo.id, "planned")}
              disabled={todo.status === "planned"}
            >
              Set to Planned
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange(todo.id, "in-progress")}
              disabled={todo.status === "in-progress"}
            >
              Set to In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange(todo.id, "completed")}
              disabled={todo.status === "completed"}
            >
              Set to Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(todo.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && todo.subTodos.length > 0 && (
        <div className="mt-3 ml-7 border-l-2 pl-4">
          <h4 className="mb-2 text-sm font-medium">Sub-tasks</h4>
          <ul className="space-y-2">
            {todo.subTodos.map((subTodo: SubTodo) => (
              <li key={subTodo.id} className="flex items-center gap-2 text-sm">
                <Badge
                  className={cn(
                    "h-2 w-2 rounded-full p-0",
                    statusColors[subTodo.status]
                  )}
                />
                <span>{subTodo.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

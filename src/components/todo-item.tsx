import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { SubTodo, TodoStatus, TodoWithSubTodos } from "@/server/db/schema"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  ListPlus,
  ListTodoIcon,
  MoreHorizontal,
  PencilIcon,
  Trash
} from "lucide-react"
import { useRef, useState } from "react"

// Add a type for todos with display status
interface TodoWithDisplayStatus extends TodoWithSubTodos {
  _displayStatus?: TodoStatus
}

// Update the props type
type TodoItemProps = {
  todo: TodoWithSubTodos | TodoWithDisplayStatus
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TodoStatus) => void
  onAddSubTodo?: (todoId: string, title: string, status?: TodoStatus) => void
  onUpdateSubTodo?: (
    id: string,
    updates: { title?: string; status?: TodoStatus }
  ) => void
  onDeleteSubTodo?: (id: string) => void
  isDraggable?: boolean
}

export function TodoItem({
  todo,
  onDelete,
  onStatusChange,
  onAddSubTodo,
  onUpdateSubTodo,
  onDeleteSubTodo,
  isDraggable = false
}: TodoItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [isAddingSubTodo, setIsAddingSubTodo] = useState(false)
  const [newSubTodoTitle, setNewSubTodoTitle] = useState("")
  const [editingSubTodoId, setEditingSubTodoId] = useState<string | null>(null)
  const [editingSubTodoTitle, setEditingSubTodoTitle] = useState("")

  const newSubTodoInputRef = useRef<HTMLInputElement>(null)
  const editSubTodoInputRef = useRef<HTMLInputElement>(null)

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

  // Get effective status for display (supports drag operations)
  const effectiveStatus = (
    "_displayStatus" in todo ? todo._displayStatus : todo.status
  ) as TodoStatus

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(date))
  }

  const handleAddSubTodoClick = () => {
    setIsAddingSubTodo(true)
    setExpanded(true)
    setTimeout(() => {
      newSubTodoInputRef.current?.focus()
    }, 0)
  }

  const handleAddSubTodoSubmit = () => {
    if (newSubTodoTitle.trim() && onAddSubTodo) {
      onAddSubTodo(todo.id, newSubTodoTitle.trim(), "planned")
      setNewSubTodoTitle("")
      setIsAddingSubTodo(false)
    }
  }

  const handleSubTodoEditClick = (subTodo: SubTodo) => {
    setEditingSubTodoId(subTodo.id)
    setEditingSubTodoTitle(subTodo.title)
    setTimeout(() => {
      editSubTodoInputRef.current?.focus()
    }, 0)
  }

  const handleSubTodoEditSubmit = () => {
    if (editingSubTodoId && editingSubTodoTitle.trim() && onUpdateSubTodo) {
      onUpdateSubTodo(editingSubTodoId, { title: editingSubTodoTitle.trim() })
      setEditingSubTodoId(null)
      setEditingSubTodoTitle("")
    }
  }

  const handleSubTodoStatusChange = (subTodoId: string, status: TodoStatus) => {
    if (onUpdateSubTodo) {
      onUpdateSubTodo(subTodoId, { status })
    }
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
              {todo.emoji ? (
                <span className="text-lg">{todo.emoji}</span>
              ) : (
                <ListTodoIcon className="size-7" />
              )}
              <h3 className="font-semibold">{todo.title}</h3>
              <Badge className={cn(statusColors[effectiveStatus])}>
                {effectiveStatus.charAt(0).toUpperCase() +
                  effectiveStatus.slice(1).replace("-", " ")}
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
              disabled={effectiveStatus === "planned"}
            >
              Set to Planned
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange(todo.id, "in-progress")}
              disabled={effectiveStatus === "in-progress"}
            >
              Set to In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange(todo.id, "completed")}
              disabled={effectiveStatus === "completed"}
            >
              Set to Completed
            </DropdownMenuItem>

            {onAddSubTodo && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAddSubTodoClick}>
                  <ListPlus className="mr-2 h-4 w-4" />
                  Add Sub-task
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
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

      {expanded && (
        <div className="mt-3 ml-7 border-l-2 pl-4">
          {todo.subTodos.length > 0 && (
            <>
              <h4 className="mb-2 text-sm font-medium">Sub-tasks</h4>
              <ul className="space-y-2">
                {todo.subTodos.map((subTodo: SubTodo) => (
                  <li
                    key={subTodo.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "h-2 w-2 rounded-full p-0",
                          statusColors[subTodo.status]
                        )}
                      />

                      {editingSubTodoId === subTodo.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleSubTodoEditSubmit()
                          }}
                          className="flex-1"
                        >
                          <Input
                            ref={editSubTodoInputRef}
                            value={editingSubTodoTitle}
                            onChange={(e) =>
                              setEditingSubTodoTitle(e.target.value)
                            }
                            onBlur={handleSubTodoEditSubmit}
                            className="h-6 py-1 text-sm"
                          />
                        </form>
                      ) : (
                        <span>{subTodo.title}</span>
                      )}
                    </div>

                    {onUpdateSubTodo &&
                      onDeleteSubTodo &&
                      editingSubTodoId !== subTodo.id && (
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSubTodoStatusChange(
                                    subTodo.id,
                                    "planned"
                                  )
                                }
                                disabled={subTodo.status === "planned"}
                              >
                                Set to Planned
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSubTodoStatusChange(
                                    subTodo.id,
                                    "in-progress"
                                  )
                                }
                                disabled={subTodo.status === "in-progress"}
                              >
                                Set to In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSubTodoStatusChange(
                                    subTodo.id,
                                    "completed"
                                  )
                                }
                                disabled={subTodo.status === "completed"}
                              >
                                Set to Completed
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleSubTodoEditClick(subTodo)}
                              >
                                <PencilIcon className="mr-2 h-3 w-3" />
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => onDeleteSubTodo(subTodo.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash className="mr-2 h-3 w-3" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {isAddingSubTodo && onAddSubTodo && (
            <div className="mt-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddSubTodoSubmit()
                }}
                className="flex gap-2"
              >
                <Input
                  ref={newSubTodoInputRef}
                  value={newSubTodoTitle}
                  onChange={(e) => setNewSubTodoTitle(e.target.value)}
                  placeholder="New sub-task..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newSubTodoTitle.trim()}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingSubTodo(false)
                    setNewSubTodoTitle("")
                  }}
                >
                  Cancel
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

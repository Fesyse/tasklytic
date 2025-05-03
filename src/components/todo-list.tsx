import { TodoItem } from "@/components/todo-item"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import type { Todo, TodoWithSubTodos } from "@/server/db/schema"
import { useState } from "react"

type TodoListProps = {
  todos: TodoWithSubTodos[]
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Todo["status"]) => void
}

export function TodoList({ todos, onDelete, onStatusChange }: TodoListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTodos = todos.filter((todo) => {
    // Filter by status
    if (filterStatus !== "all" && todo.status !== filterStatus) {
      return false
    }

    // Filter by search term
    if (
      searchTerm &&
      !todo.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !todo.subTodos.some((subTodo) =>
        subTodo.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) {
      return false
    }

    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search todos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed">
            {searchTerm || filterStatus !== "all"
              ? "No todos match your filters"
              : "No todos yet. Create your first one!"}
          </div>
        )}
      </div>
    </div>
  )
}

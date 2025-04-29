import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import type { Todo, TodoStatus } from "@/lib/types"
import { Plus, X } from "lucide-react"
import { useState } from "react"

interface TodoFormProps {
  onSave: (todo: Todo) => void
  onCancel: () => void
}

interface SubTodoInput {
  title: string
  status: TodoStatus
}

export function TodoForm({ onSave, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState("")
  const [emoji, setEmoji] = useState("")
  const [status, setStatus] = useState<TodoStatus>("planned")
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState("")
  const [subTodos, setSubTodos] = useState<SubTodoInput[]>([])
  const [newSubTodo, setNewSubTodo] = useState("")

  const addSubTodo = () => {
    if (newSubTodo.trim()) {
      setSubTodos([
        ...subTodos,
        {
          title: newSubTodo,
          status: "planned"
        }
      ])
      setNewSubTodo("")
    }
  }

  const removeSubTodo = (index: number) => {
    setSubTodos(subTodos.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      emoji: emoji.trim() || undefined,
      status,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      subTodos: subTodos.map((st) => ({
        id: crypto.randomUUID(),
        title: st.title,
        status: st.status,
        createdAt: new Date()
      }))
    }

    onSave(newTodo)
  }

  return (
    <Card className="p-4">
      <h2 className="mb-4 text-lg font-semibold">Create New Todo</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid grid-cols-[64px_1fr] gap-2">
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                placeholder="🚀"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="title" className="required">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as TodoStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          <div>
            <Label>Sub-tasks</Label>
            <div className="mt-2 space-y-2">
              {subTodos.map((subTodo, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-grow">{subTodo.title}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubTodo(index)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Add sub-task"
                  value={newSubTodo}
                  onChange={(e) => setNewSubTodo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSubTodo()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addSubTodo}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Todo
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}

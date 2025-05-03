"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import type { TodoStatus } from "@/server/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Define the form schema with zod
const todoFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  emoji: z.string().emoji().optional(),
  status: z.enum(["planned", "in-progress", "completed"] as const),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional()
})

type TodoFormValues = z.infer<typeof todoFormSchema>

type TodoFormProps = {
  onSave: (todo: CreateTodo) => void
  onCancel: () => void
}

type SubTodoInput = {
  title: string
  status: TodoStatus
}

export type CreateTodo = {
  title: string
  emoji?: string | null
  status: TodoStatus
  startDate: Date
  endDate?: Date | null
  subTodos: SubTodoInput[]
}

export function TodoForm({ onSave, onCancel }: TodoFormProps) {
  const [subTodos, setSubTodos] = useState<SubTodoInput[]>([])
  const [newSubTodo, setNewSubTodo] = useState("")

  // Initialize the form with default values
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: "",
      emoji: "",
      status: "planned",
      startDate: new Date().toISOString().split("T")[0],
      endDate: ""
    }
  })

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

  function onSubmit(data: TodoFormValues) {
    const newTodo = {
      title: data.title.trim(),
      emoji: data.emoji?.trim() ?? null,
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      subTodos: subTodos.map((st) => ({
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-[40px_1fr] gap-2">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji</FormLabel>
                  <FormControl>
                    <Input placeholder="🚀" maxLength={1} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Start Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={form.watch("startDate")}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormLabel className="mb-2 block">Sub-tasks</FormLabel>
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
            <Button type="submit">Create Todo</Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

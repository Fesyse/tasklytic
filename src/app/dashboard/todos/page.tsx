"use client"

import { TodoForm } from "@/components/todo-form"
import { TodoKanban } from "@/components/todo-kanban"
import { TodoList } from "@/components/todo-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Todo, ViewMode } from "@/lib/types"
import { LayoutGrid, ListFilter, Plus } from "lucide-react"
import { useState } from "react"
import { mockTodos } from "./data"

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>(mockTodos)
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const handleAddTodo = (todo: Todo) => {
    setTodos([todo, ...todos])
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const handleStatusChange = (id: string, status: Todo["status"]) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, status } : todo)))
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Todos</h1>
          <p className="text-muted-foreground">
            Manage your tasks and stay organized
          </p>
        </div>

        <div className="flex gap-2">
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
            className="mr-4"
          >
            <TabsList>
              <TabsTrigger value="list">
                <ListFilter className="mr-2 h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Todo
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <TodoForm
            onSave={handleAddTodo}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {viewMode === "list" ? (
        <TodoList
          todos={todos}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <TodoKanban
          todos={todos}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

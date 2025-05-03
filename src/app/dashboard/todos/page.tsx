"use client"

import { TodoForm } from "@/components/todo-form"
import { TodoKanban } from "@/components/todo-kanban"
import { TodoList } from "@/components/todo-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ViewMode } from "@/lib/types"
import type { Todo, TodoWithSubTodos } from "@/server/db/schema"
import { api } from "@/trpc/react"
import { LayoutGrid, ListFilter, Plus } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

const viewModeSchema = z.enum(["list", "kanban"] as const)

export default function TodosPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { success, data: defaultViewMode } = viewModeSchema.safeParse(
    searchParams.get("view-mode")
  )

  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(
    success ? defaultViewMode : "list"
  )

  // Fetch todos using tRPC
  const { data: todos, isLoading, refetch } = api.todo.getAll.useQuery()

  // Use tRPC mutations for CRUD operations
  const createTodo = api.todo.create.useMutation({
    onSuccess: () => refetch()
  })

  const updateTodo = api.todo.update.useMutation({
    onSuccess: () => refetch()
  })

  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: () => refetch()
  })

  const handleAddTodo = (todo: TodoWithSubTodos) => {
    createTodo.mutate({
      title: todo.title,
      emoji: todo.emoji ?? undefined,
      status: todo.status,
      startDate: todo.startDate,
      endDate: todo.endDate ?? undefined,
      subTodos: todo.subTodos.map((st) => ({
        title: st.title,
        status: st.status
      }))
    })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    deleteTodo.mutate({ id })
  }

  const handleStatusChange = (id: string, status: Todo["status"]) => {
    updateTodo.mutate({ id, status })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
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
            onValueChange={(value) => {
              setViewMode(value as ViewMode)
              router.push(`/dashboard/todos?view-mode=${value}`)
            }}
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

      {isLoading || !todos ? (
        <div className="flex h-64 items-center justify-center">
          <p>Loading todos...</p>
        </div>
      ) : (
        <div className="relative">
          <AnimatePresence>
            {viewMode === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  filter: "blur(10px)",
                  position: "absolute"
                }}
                transition={{ duration: 0.3 }}
              >
                <TodoList
                  todos={todos}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              </motion.div>
            ) : (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  filter: "blur(10px)",
                  position: "absolute"
                }}
                transition={{ duration: 0.3 }}
              >
                <TodoKanban
                  todos={todos}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

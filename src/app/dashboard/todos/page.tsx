"use client"

import { TodoForm, type CreateTodo } from "@/components/todo-form"
import { TodoKanban } from "@/components/todo-kanban"
import { TodoList } from "@/components/todo-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ViewMode } from "@/lib/types"
import type { SubTodo, TodoStatus, TodoWithSubTodos } from "@/server/db/schema"
import { api } from "@/trpc/react"
import { LayoutGrid, ListFilter, Plus } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRouter, useSearchParams } from "next/navigation"
import { startTransition, useOptimistic, useState } from "react"
import { z } from "zod"
import TodosLoading from "./loading"

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
  const { data: todos = [], isLoading, refetch } = api.todo.getAll.useQuery()

  // Use optimistic todos with the useOptimistic hook
  const [optimisticTodos, addOptimisticTodos] = useOptimistic<
    TodoWithSubTodos[],
    {
      action:
        | "create"
        | "update"
        | "delete"
        | "createSubTodo"
        | "updateSubTodo"
        | "deleteSubTodo"
      data: any
    }
  >(todos, (currentTodos, { action, data }) => {
    // Create a copy of the current todos
    const todosCopy = [...currentTodos]

    switch (action) {
      case "create": {
        // Add the new todo to the beginning of the list
        return [data, ...todosCopy]
      }

      case "update": {
        // Update the todo with matching id
        return todosCopy.map((todo) =>
          todo.id === data.id
            ? { ...todo, ...data, status: data.status ?? todo.status }
            : todo
        )
      }

      case "delete": {
        // Remove the todo with matching id
        return todosCopy.filter((todo) => todo.id !== data.id)
      }

      case "createSubTodo": {
        // Add the new subtodo to the parent todo
        return todosCopy.map((todo) =>
          todo.id === data.todoId
            ? {
                ...todo,
                subTodos: [...todo.subTodos, data.subTodo]
              }
            : todo
        )
      }

      case "updateSubTodo": {
        // Update the subtodo in its parent todo
        return todosCopy.map((todo) => {
          // Find if this todo contains the subtodo
          const subTodoIndex = todo.subTodos.findIndex(
            (sub) => sub.id === data.id
          )

          if (subTodoIndex >= 0) {
            // Create a copy of the subtodos array
            const newSubTodos = [...todo.subTodos]
            // Get the current subtodo
            const currentSubTodo = newSubTodos[subTodoIndex]

            if (currentSubTodo) {
              // Update the subtodo with new values
              newSubTodos[subTodoIndex] = {
                id: currentSubTodo.id,
                title: data.title ?? currentSubTodo.title,
                status: data.status ?? currentSubTodo.status,
                createdAt: currentSubTodo.createdAt,
                todoId: currentSubTodo.todoId
              }

              // Return the updated todo
              return {
                ...todo,
                subTodos: newSubTodos
              }
            }
          }

          // No matching subtodo found, return todo unchanged
          return todo
        })
      }

      case "deleteSubTodo": {
        // Remove the subtodo from its parent todo
        return todosCopy.map((todo) => ({
          ...todo,
          subTodos: todo.subTodos.filter((subTodo) => subTodo.id !== data.id)
        }))
      }

      default:
        return todosCopy
    }
  })

  // Use the tRPC mutations but with the new useOptimistic approach
  const createTodo = api.todo.create.useMutation({
    onSettled: () => {
      refetch()
    }
  })

  const updateTodo = api.todo.update.useMutation({
    onSettled: () => {
      refetch()
    }
  })

  const deleteTodo = api.todo.delete.useMutation({
    onSettled: () => {
      refetch()
    }
  })

  // SubTodo mutations
  const createSubTodo = api.todo.createSubTodo.useMutation({
    onSettled: () => {
      refetch()
    }
  })

  const updateSubTodo = api.todo.updateSubTodo.useMutation({
    onSettled: () => {
      refetch()
    }
  })

  const deleteSubTodo = api.todo.deleteSubTodo.useMutation({
    onSettled: () => {
      refetch()
    }
  })

  const handleAddTodo = (todo: CreateTodo) => {
    // Create an optimistic todo with a temporary ID
    const tempId = `temp-${Date.now()}`
    const optimisticTodo: TodoWithSubTodos = {
      id: tempId,
      title: todo.title,
      emoji: todo.emoji ?? null,
      status: todo.status ?? "planned",
      startDate: todo.startDate,
      endDate: todo.endDate ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "", // Will be filled by server
      subTodos: (todo.subTodos ?? []).map((subTodo, index) => ({
        id: `${tempId}-sub-${index}`,
        title: subTodo.title,
        status: subTodo.status ?? "planned",
        createdAt: new Date(),
        todoId: tempId
      }))
    }

    // Apply optimistic update
    addOptimisticTodos({ action: "create", data: optimisticTodo })

    // Perform the actual mutation inside a transition
    startTransition(async () => {
      await createTodo.mutateAsync({
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
    })

    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    // Apply optimistic update
    addOptimisticTodos({ action: "delete", data: { id } })

    // Perform the actual mutation inside a transition
    startTransition(async () => {
      await deleteTodo.mutateAsync({ id })
    })
  }

  const handleStatusChange = (id: string, status: TodoStatus) => {
    // Apply optimistic update
    addOptimisticTodos({ action: "update", data: { id, status } })

    // Perform the actual mutation inside a transition
    startTransition(async () => {
      await updateTodo.mutateAsync({ id, status })
    })
  }

  // Add handlers for SubTodo operations
  const handleAddSubTodo = (
    todoId: string,
    title: string,
    status: TodoStatus = "planned"
  ) => {
    // Create an optimistic subtodo
    const tempId = `temp-sub-${Date.now()}`
    const optimisticSubTodo: SubTodo = {
      id: tempId,
      title,
      status,
      createdAt: new Date(),
      todoId
    }

    // Apply optimistic update
    addOptimisticTodos({
      action: "createSubTodo",
      data: {
        todoId,
        subTodo: optimisticSubTodo
      }
    })

    // Perform the actual mutation inside a transition
    startTransition(async () => {
      await createSubTodo.mutateAsync({ todoId, title, status })
    })
  }

  const handleUpdateSubTodo = (
    id: string,
    updates: { title?: string; status?: TodoStatus }
  ) => {
    // Apply optimistic update
    addOptimisticTodos({
      action: "updateSubTodo",
      data: { id, ...updates }
    })

    // Perform the actual mutation inside a transition
    startTransition(async () => {
      await updateSubTodo.mutateAsync({ id, ...updates })
    })
  }

  const handleDeleteSubTodo = (id: string) => {
    // Apply optimistic update
    addOptimisticTodos({ action: "deleteSubTodo", data: { id } })

    // Perform the actual mutation inside a transition
    startTransition(async () => {
      await deleteSubTodo.mutateAsync({ id })
    })
  }

  // The display todos are now simply the optimistic todos
  const displayTodos = optimisticTodos

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

      {isLoading && !displayTodos.length ? (
        <TodosLoading />
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
                  todos={displayTodos}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onAddSubTodo={handleAddSubTodo}
                  onUpdateSubTodo={handleUpdateSubTodo}
                  onDeleteSubTodo={handleDeleteSubTodo}
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
                  todos={displayTodos}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onAddSubTodo={handleAddSubTodo}
                  onUpdateSubTodo={handleUpdateSubTodo}
                  onDeleteSubTodo={handleDeleteSubTodo}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

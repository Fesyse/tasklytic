export type TodoStatus = "planned" | "in-progress" | "completed"

export interface SubTodo {
  id: string
  title: string
  status: TodoStatus
  createdAt: Date
}

export interface Todo {
  id: string
  title: string
  emoji?: string
  status: TodoStatus
  startDate: Date
  endDate?: Date
  subTodos: SubTodo[]
}

export type ViewMode = "list" | "kanban"

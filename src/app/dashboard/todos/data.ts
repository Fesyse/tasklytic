import type { Todo, TodoStatus } from "@/lib/types"

// Helper function to create a new todo
export function createTodo(
  title: string,
  status: TodoStatus = "planned",
  emoji?: string,
  startDate: Date = new Date(),
  endDate?: Date,
  subTodos: any[] = []
): Todo {
  return {
    id: crypto.randomUUID(),
    title,
    emoji,
    status,
    startDate,
    endDate,
    subTodos: subTodos.map((st) => ({
      id: crypto.randomUUID(),
      title: st.title,
      status: st.status || "planned",
      createdAt: new Date()
    }))
  }
}

// Mock data
export const mockTodos: Todo[] = [
  createTodo(
    "Complete project proposal",
    "in-progress",
    "📝",
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    [
      { title: "Research competition", status: "completed" },
      { title: "Draft initial document", status: "completed" },
      { title: "Get feedback from team", status: "in-progress" },
      { title: "Finalize proposal", status: "planned" }
    ]
  ),
  createTodo(
    "Design system update",
    "planned",
    "🎨",
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    [
      { title: "Audit current components", status: "planned" },
      { title: "Create new color palette", status: "planned" },
      { title: "Update typography", status: "planned" }
    ]
  ),
  createTodo(
    "Team meeting preparation",
    "completed",
    "👥",
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    [
      { title: "Prepare agenda", status: "completed" },
      { title: "Send calendar invites", status: "completed" },
      { title: "Prepare slides", status: "completed" }
    ]
  ),
  createTodo(
    "Learn new framework",
    "in-progress",
    "🚀",
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    [
      { title: "Complete basic tutorial", status: "completed" },
      { title: "Build sample application", status: "in-progress" },
      { title: "Read advanced documentation", status: "in-progress" },
      { title: "Contribute to open source", status: "planned" }
    ]
  ),
  createTodo(
    "Write blog post",
    "planned",
    "✍️",
    new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    [
      { title: "Research topic", status: "planned" },
      { title: "Create outline", status: "planned" },
      { title: "Write first draft", status: "planned" }
    ]
  )
]

// Initial state for new todo form
export const emptyTodo: Partial<Todo> = {
  title: "",
  emoji: "",
  status: "planned",
  startDate: new Date(),
  subTodos: []
}

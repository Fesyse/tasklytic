import { init } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import {
  boolean,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core"

const createId = init({
  fingerprint: "tasklytic",
  length: 20
})
export const createTable = pgTableCreator((name) => `tasklytic_${name}`)

export const users = createTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
})

export const sessions = createTable("session", {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => createId())
    .primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id)
})

export const accounts = createTable("account", {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => createId())
    .primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
})

export const verification = createTable("verification", {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => createId())
    .primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at")
})

// Enum for todo status
export const todoStatusEnum = pgEnum("todo_status", [
  "planned",
  "in-progress",
  "completed"
])
export type TodoStatus = (typeof todoStatusEnum.enumValues)[number]

// Todo table
export const todos = createTable("todo", {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title").notNull(),
  emoji: text("emoji"),
  status: todoStatusEnum("status").notNull().default("planned"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id)
})

// SubTodo table
export const subTodos = createTable("sub_todo", {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title").notNull(),
  status: todoStatusEnum("status").notNull().default("planned"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  todoId: varchar("todo_id", { length: 36 })
    .notNull()
    .references(() => todos.id, { onDelete: "cascade" })
})

// Define relations
export const todosRelations = relations(todos, ({ many, one }) => ({
  subTodos: many(subTodos),
  user: one(users, {
    fields: [todos.userId],
    references: [users.id]
  })
}))

export const subTodosRelations = relations(subTodos, ({ one }) => ({
  todo: one(todos, {
    fields: [subTodos.todoId],
    references: [todos.id]
  })
}))

export type Todo = typeof todos.$inferSelect
export type SubTodo = typeof subTodos.$inferSelect
export type TodoWithSubTodos = Todo & {
  subTodos: SubTodo[]
}

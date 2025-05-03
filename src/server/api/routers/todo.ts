import { createId } from "@paralleldrive/cuid2"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { subTodos, todos } from "@/server/db/schema"

// Schema for todo status
const todoStatusSchema = z.enum(["planned", "in-progress", "completed"])

// Schema for creating a new todo
const createTodoSchema = z.object({
  title: z.string().min(1),
  emoji: z.string().optional(),
  status: todoStatusSchema.default("planned"),
  startDate: z.date(),
  endDate: z.date().optional(),
  subTodos: z
    .array(
      z.object({
        title: z.string().min(1),
        status: todoStatusSchema.default("planned")
      })
    )
    .default([])
})

// Schema for updating a todo
const updateTodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  emoji: z.string().optional(),
  status: todoStatusSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
})

// Schema for creating a sub-todo
const createSubTodoSchema = z.object({
  todoId: z.string(),
  title: z.string().min(1),
  status: todoStatusSchema.default("planned")
})

// Schema for updating a sub-todo
const updateSubTodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  status: todoStatusSchema.optional()
})

export const todoRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userTodos = await ctx.db.query.todos.findMany({
      where: eq(todos.userId, ctx.session.user.id),
      with: {
        subTodos: true
      },
      orderBy: (todos, { desc }) => [desc(todos.createdAt)]
    })

    return userTodos
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const todo = await ctx.db.query.todos.findFirst({
        where: and(
          eq(todos.id, input.id),
          eq(todos.userId, ctx.session.user.id)
        ),
        with: {
          subTodos: true
        }
      })

      return todo
    }),

  // Create a new todo
  create: protectedProcedure
    .input(createTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const todoId = createId()

      // First create the todo
      await ctx.db.insert(todos).values({
        id: todoId,
        title: input.title,
        emoji: input.emoji,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: ctx.session.user.id
      })

      // Then create any sub-todos
      if (input.subTodos.length > 0) {
        await ctx.db.insert(subTodos).values(
          input.subTodos.map((subTodo) => ({
            id: createId(),
            title: subTodo.title,
            status: subTodo.status,
            createdAt: new Date(),
            todoId: todoId
          }))
        )
      }

      // Return the created todo with its sub-todos
      return ctx.db.query.todos.findFirst({
        where: eq(todos.id, todoId),
        with: {
          subTodos: true
        }
      })
    }),

  update: protectedProcedure
    .input(updateTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      await ctx.db
        .update(todos)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(and(eq(todos.id, id), eq(todos.userId, ctx.session.user.id)))

      return ctx.db.query.todos.findFirst({
        where: eq(todos.id, id),
        with: {
          subTodos: true
        }
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(todos)
        .where(
          and(eq(todos.id, input.id), eq(todos.userId, ctx.session.user.id))
        )

      return { success: true }
    }),

  createSubTodo: protectedProcedure
    .input(createSubTodoSchema)
    .mutation(async ({ ctx, input }) => {
      // First verify the parent todo belongs to this user
      const todo = await ctx.db.query.todos.findFirst({
        where: and(
          eq(todos.id, input.todoId),
          eq(todos.userId, ctx.session.user.id)
        )
      })

      if (!todo) {
        throw new Error("Todo not found or does not belong to this user")
      }

      const subTodoId = createId()

      await ctx.db.insert(subTodos).values({
        id: subTodoId,
        title: input.title,
        status: input.status,
        createdAt: new Date(),
        todoId: input.todoId
      })

      return ctx.db.query.subTodos.findFirst({
        where: eq(subTodos.id, subTodoId)
      })
    }),

  updateSubTodo: protectedProcedure
    .input(updateSubTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify this sub-todo belongs to a todo owned by this user
      const subTodo = await ctx.db.query.subTodos.findFirst({
        where: eq(subTodos.id, id),
        with: {
          todo: true
        }
      })

      if (!subTodo || subTodo.todo.userId !== ctx.session.user.id) {
        throw new Error("Sub-todo not found or does not belong to this user")
      }

      await ctx.db.update(subTodos).set(updateData).where(eq(subTodos.id, id))

      return ctx.db.query.subTodos.findFirst({
        where: eq(subTodos.id, id)
      })
    }),

  deleteSubTodo: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify this sub-todo belongs to a todo owned by this user
      const subTodo = await ctx.db.query.subTodos.findFirst({
        where: eq(subTodos.id, input.id),
        with: {
          todo: true
        }
      })

      if (!subTodo || subTodo.todo.userId !== ctx.session.user.id) {
        throw new Error("Sub-todo not found or does not belong to this user")
      }

      await ctx.db.delete(subTodos).where(eq(subTodos.id, input.id))

      return { success: true }
    })
})

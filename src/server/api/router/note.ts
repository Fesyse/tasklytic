import { TElement } from "@udecode/plate-common"
import { and, asc, desc, eq, like, or } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { z } from "zod"
import { searchQueryFormat } from "@/lib/utils"
import { blockContent, order, sortBy } from "@/lib/schemas"
import {
  createTRPCRouter,
  ProtectedCtx,
  protectedProcedure
} from "@/server/api/trpc"
import { db } from "@/server/db"
import { noteContent, notes, type Note } from "@/server/db/schema"

const cacheKeys = {
  all: `projects:notes:all`,
  one: `projects:notes:one`,
  pinned: `projects:notes:all:pinned`,
  unpinned: `projects:notes:all:unpinned`
}

const filtersSchema = z
  .object({
    sortBy: z.enum(sortBy).optional(),
    order: z.enum(order).optional(),
    search: z.string().optional()
  })
  .optional()

const getNoteById = async (
  data: { projectId: string; id: string },
  ctx: ProtectedCtx
) => {
  "use cache"

  const note = await db.query.notes.findFirst({
    where: (notesTable, { and, not, eq }) =>
      and(
        eq(notesTable.id, data.id),
        or(
          // if user is owner of the note, then we showing private note
          and(
            eq(notesTable.projectId, data.projectId),
            not(eq(notesTable.userId, ctx.session.user.id)),
            eq(notesTable.private, true)
          ),
          // otherwise we only showing public note
          and(
            eq(notesTable.projectId, data.projectId),
            eq(notesTable.private, false)
          )
        )
      )
  })

  if (!note) return null

  const key = `${cacheKeys.one}:${data.projectId}:${data.id}`
  cacheTag(key)

  return note as any
}

const getNoteContent = async (data: { projectId: string; noteId: string }) => {
  const noteContent = await db.query.noteContent.findFirst({
    where: (noteContentTable, { and, eq }) =>
      and(
        eq(noteContentTable.noteId, data.noteId),
        eq(noteContentTable.projectId, data.projectId)
      )
  })

  return noteContent
}

const getAllNotes = async (
  data: {
    projectId: string
    filters: z.infer<typeof filtersSchema>
  },
  ctx: ProtectedCtx
) => {
  "use cache"
  const columnSortBy = data.filters
    ? data.filters.sortBy !== "alphabetical"
      ? data.filters.sortBy
      : "title"
    : undefined

  const result: Note[] = await db.query.notes.findMany({
    orderBy: data.filters
      ? [
          data.filters.order === "desc"
            ? desc(notes[columnSortBy ?? "title"])
            : asc(notes[columnSortBy ?? "title"])
        ]
      : undefined,
    where: (notesTable, { and, not, eq }) =>
      and(
        data.filters?.search
          ? like(notesTable.title, searchQueryFormat(data.filters.search))
          : undefined,
        or(
          // if user is owner of the note, then we showing private note
          and(
            eq(notesTable.projectId, data.projectId),
            not(eq(notesTable.userId, ctx.session.user.id)),
            eq(notesTable.private, true)
          ),
          // otherwise we only showing public note
          and(
            eq(notesTable.projectId, data.projectId),
            eq(notesTable.private, false)
          )
        )
      )
  })

  cacheTag(`${cacheKeys.all}:${data.projectId}`)

  return result
}

// Pinned/Unpinned

export const getAllPinnedNotes = async (
  data: {
    projectId: string
  },
  ctx: ProtectedCtx
) => {
  "use cache"
  const result: Note[] = await db.query.notes.findMany({
    where: (notesTable, { and, not, eq }) =>
      and(
        or(
          // if user is owner of the note, then we showing private note
          and(
            eq(notesTable.projectId, data.projectId),
            not(eq(notesTable.userId, ctx.session.user.id)),
            eq(notesTable.private, true)
          ),
          // otherwise we only showing public note
          and(
            eq(notesTable.projectId, data.projectId),
            eq(notesTable.private, false)
          )
        ),
        eq(notesTable.isPinned, true)
      )
  })

  cacheTag(
    `${cacheKeys.all}:${data.projectId}`,
    `${cacheKeys.all}:${data.projectId}:pinned`
  )

  return result
}
const getAllUnpinnedNotes = async (
  data: {
    projectId: string
  },
  ctx: ProtectedCtx
) => {
  "use cache"
  const result: Note[] = await db.query.notes.findMany({
    where: (notesTable, { and, not, eq }) =>
      and(
        or(
          // if user is owner of the note, then we showing private note
          and(
            eq(notesTable.projectId, data.projectId),
            not(eq(notesTable.userId, ctx.session.user.id)),
            eq(notesTable.private, true)
          ),
          // otherwise we only showing public note
          and(
            eq(notesTable.projectId, data.projectId),
            eq(notesTable.private, false)
          )
        ),
        eq(notesTable.isPinned, false)
      )
  })

  cacheTag(
    `${cacheKeys.all}:${data.projectId}`,
    `${cacheKeys.all}:${data.projectId}:unpinned`
  )

  return result
}

// All root notes

export const getAllRootNotes = async (
  data: {
    projectId: string
  },
  ctx: ProtectedCtx
) => {
  "use cache"
  const result: Note[] = await db.query.notes.findMany({
    where: (notesTable, { and, eq, isNull, not }) =>
      and(
        eq(notesTable.projectId, data.projectId),
        or(
          // if user is owner of the note, then we showing private note
          and(
            eq(notesTable.projectId, data.projectId),
            not(eq(notesTable.userId, ctx.session.user.id))
          ),
          // otherwise we only showing public note
          and(
            eq(notesTable.projectId, data.projectId),
            eq(notesTable.private, false)
          )
        ),
        // that way we get notes without a folder
        isNull(notesTable.folderId)
      )
  })

  cacheTag(
    `${cacheKeys.all}:${data.projectId}`,
    `${cacheKeys.all}:${data.projectId}:root`
  )

  return result
}

const revalidateWorkspace = (note: Note) => {
  if (note.folderId)
    revalidateTag(`folders:workspace:sub-folders:${note.folderId}`)
  if (note.isPinned) revalidateTag(`${cacheKeys.all}:${note.projectId}:pinned`)
  revalidateTag(`folders:workspace:${note.projectId}`)
  revalidateTag(`${cacheKeys.all}:${note.projectId}`)
  revalidateTag(`${cacheKeys.all}:${note.projectId}:root`)
  revalidateTag(`${cacheKeys.one}:${note.projectId}:${note.id}`)
}

// Router
export const notesRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const result = getNoteById(input, ctx)
      return result
    }),
  getByIdWithContent: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const [note, content] = await Promise.all([
        getNoteById(input, ctx),
        getNoteContent({ ...input, noteId: input.id })
      ])

      return { ...note, content }
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        filters: filtersSchema
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await getAllNotes(
        {
          projectId: input.projectId,
          filters: input.filters
        },
        ctx
      )

      return result
    }),

  getAllPinned: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await getAllPinnedNotes(input, ctx)

      return result
    }),
  getAllUnpinned: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await getAllUnpinnedNotes(input, ctx)

      return result
    }),
  getAllRoot: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const notes = await getAllRootNotes(input, ctx)

      return notes
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        folderId: z.string().optional(),
        content: blockContent.optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db
        .insert(notes)
        .values({
          projectId: input.projectId,
          folderId: input.folderId,
          userId: ctx.session.user.id,
          private: false,
          isPinned: false
        })
        .returning()
        .then(r => r[0]!)

      await ctx.db.insert(noteContent).values({
        content: (input.content ?? []) satisfies TElement[],
        noteId: note.id,
        projectId: input.projectId
      })

      revalidateWorkspace(note)

      return note
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().max(20).optional(),
        private: z.boolean().optional(),
        isPinned: z.boolean().optional(),
        emoji: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db
        .update(notes)
        .set(input)
        .where(eq(notes.id, input.id))
        .returning()
        .then(r => r[0]!)

      revalidateWorkspace(note)

      return note
    }),
  updateContent: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        contentId: z.string(),
        content: blockContent.optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(noteContent)
        .set({ content: input.content })
        .where(
          and(
            eq(noteContent.id, input.contentId),
            eq(noteContent.projectId, input.projectId)
          )
        )
        .returning()
        .then(r => r[0]!)

      return true
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db
        .delete(notes)
        .where(eq(notes.id, input.id))
        .returning()
        .then(r => r[0]!)

      revalidateWorkspace(note)

      return note
    })
})

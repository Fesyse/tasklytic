import { PROJECT_PLANS, TASK_STATUS } from "@/lib/constants"
import { init } from "@paralleldrive/cuid2"
import { TElement } from "@udecode/plate-common"
import { relations, sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core"
import { type AdapterAccount } from "next-auth/adapters"

export const createCuid = init({
  fingerprint: "tasklytic",
  length: 20
})

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(name => `tasklytic_${name}`)

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => createCuid()),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  subscriptionEndDate: timestamp("subscription_end_date", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdate(() => new Date())
})

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 })
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId)
  })
)

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true
    }).notNull()
  },
  session => ({
    userIdIdx: index("session_user_id_idx").on(session.userId)
  })
)

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true
    }).notNull()
  },
  vt => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
  })
)

export const projects = createTable("project", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createCuid()),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  plan: varchar("plan", { length: 255, enum: PROJECT_PLANS })
    .notNull()
    .default("Free"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdate(() => new Date())
})

export const notes = createTable("notes", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createCuid()),
  title: varchar("title", { length: 255 })
    .notNull()
    .$defaultFn(() => "Untitled"),
  emoji: varchar("emoji", { length: 255 }),
  private: boolean("private")
    .notNull()
    .$defaultFn(() => false),
  projectId: varchar("project_id", { length: 255 })
    .notNull()
    .references(() => projects.id),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  isPinned: boolean("is_pinned").notNull().default(false),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdate(() => new Date())
})

export const databases = createTable("database", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => createCuid())
})

export const blocks = createTable("block", {
  /**
   * The id of the block, generated by platejs
   */
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  order: integer("order").notNull(),
  content: jsonb("content").notNull().$type<TElement>(),

  projectId: varchar("project_id", { length: 255 })
    .notNull()
    .references(() => projects.id),
  noteId: varchar("note_id", { length: 255 })
    .notNull()
    .references(() => notes.id),

  databaseId: varchar("database_id", { length: 255 }).references(
    () => databases.id
  ),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdate(() => new Date())
})

export const tasks = createTable("task", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => createCuid()),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 255, enum: TASK_STATUS }).notNull(),
  deadLineDate: timestamp("dead_line_date", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  databaseId: varchar("database_id", { length: 255 })
    .notNull()
    .references(() => databases.id),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdate(() => new Date())
})

export const subTasks = createTable("sub_task", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => createCuid()),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 255, enum: TASK_STATUS }).notNull(),
  deadLineDate: timestamp("dead_line_date", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),

  taskId: varchar("task_id", { length: 255 })
    .notNull()
    .references(() => tasks.id),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdate(() => new Date())
})

export const projectMemberships = createTable("project_membership", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createCuid()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  projectId: varchar("project_id", { length: 255 })
    .notNull()
    .references(() => projects.id),
  role: varchar("role", {
    length: 255,
    enum: ["participant", "admin", "owner"]
  }).notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdate(() => new Date())
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  projectMemberships: many(projectMemberships)
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] })
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] })
}))

export const notesRelations = relations(notes, ({ many, one }) => ({
  project: one(projects, {
    fields: [notes.projectId],
    references: [projects.id]
  }),
  blocks: many(blocks)
}))

export const databasesRelations = relations(databases, ({ many }) => ({
  tasks: many(tasks)
}))

export const blocksRelations = relations(blocks, ({ one }) => ({
  note: one(notes, {
    fields: [blocks.noteId],
    references: [notes.id]
  })
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  database: one(databases, {
    fields: [tasks.databaseId],
    references: [databases.id]
  }),
  subTasks: many(subTasks)
}))

export const subTasksRelations = relations(subTasks, ({ one }) => ({
  task: one(tasks, { fields: [subTasks.taskId], references: [tasks.id] })
}))

export const projectsRelations = relations(projects, ({ many, one }) => ({
  notes: many(notes),
  projectMemberships: many(projectMemberships)
}))

export const projectMembershipsRelations = relations(
  projectMemberships,
  ({ one }) => ({
    user: one(users, {
      fields: [projectMemberships.userId],
      references: [users.id]
    }),
    project: one(projects, {
      fields: [projectMemberships.projectId],
      references: [projects.id]
    })
  })
)

export type Project = typeof projects.$inferSelect
export type ProjectMembership = typeof projectMemberships.$inferSelect
export type ProjectWithMemberShip = Project & {
  membership: ProjectMembership
}
export type ProjectWithNotes = Project & {
  notes: Note[]
}
export type Task = typeof tasks.$inferSelect
export type Note = typeof notes.$inferSelect
export type Block = typeof blocks.$inferSelect

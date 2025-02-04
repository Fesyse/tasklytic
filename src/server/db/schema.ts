import { init } from "@paralleldrive/cuid2"
import { TElement } from "@udecode/plate-common"
import { relations, sql } from "drizzle-orm"
import {
  AnyPgColumn,
  boolean,
  integer,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core"
import { PROJECT_PLANS, TASK_STATUS } from "@/lib/constants"

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
  emailVerified: boolean("email_verified").default(false),
  image: varchar("image", { length: 255 }),

  // Payments
  customerId: varchar("customer_id", { length: 255 }).unique(),
  subscriptionId: varchar("subscription_id", { length: 255 }).unique(),
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
  }).$onUpdateFn(() => new Date())
})

// Auth

export const accounts = createTable("account", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => createCuid()),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: varchar("scope", { length: 255 }),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdateFn(() => new Date())
    .notNull()
})

export const sessions = createTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  token: text("token").notNull().unique(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: varchar("user_agent", { length: 255 }),

  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdateFn(() => new Date())
    .notNull()
})

export const verification = createTable("verification", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),

  expiresAt: timestamp("expires_at", {
    mode: "date",
    withTimezone: true
  }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date())
})

// Projects

export const projects = createTable("project", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createCuid()),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdateFn(() => new Date())
})

export const folders = createTable("folder", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createCuid()),
  name: varchar("name", { length: 255 }).notNull(),
  emoji: varchar("emoji", { length: 255 }),

  parentFolderId: varchar("folder_id", { length: 255 }).references(
    (): AnyPgColumn => folders.id
  ),
  projectId: varchar("project_id", { length: 255 })
    .notNull()
    .references(() => projects.id),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdateFn(() => new Date())
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
  isPinned: boolean("is_pinned").notNull().default(false),

  folderId: varchar("folder_id", { length: 255 }).references(() => folders.id),
  projectId: varchar("project_id", { length: 255 })
    .notNull()
    .references(() => projects.id),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdateFn(() => new Date())
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
  }).$onUpdateFn(() => new Date())
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
  }).$onUpdateFn(() => new Date())
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
  }).$onUpdateFn(() => new Date())
})

export const projectMemberships = createTable("project_membership", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createCuid()),
  role: varchar("role", {
    length: 255,
    enum: ["participant", "admin", "owner"]
  }).notNull(),

  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  projectId: varchar("project_id", { length: 255 })
    .notNull()
    .references(() => projects.id),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true
  }).$onUpdateFn(() => new Date())
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

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parentFolder: one(folders, {
    fields: [folders.parentFolderId],
    references: [folders.id],
    relationName: "subFolders"
  }),
  subFolders: many(folders, {
    relationName: "subFolders"
  }),
  notes: many(notes)
}))

export const notesRelations = relations(notes, ({ many, one }) => ({
  project: one(projects, {
    fields: [notes.projectId],
    references: [projects.id]
  }),
  folder: one(folders, {
    fields: [notes.folderId],
    references: [folders.id]
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

export const projectsRelations = relations(projects, ({ many }) => ({
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

export type User = typeof users.$inferSelect
export type Project = typeof projects.$inferSelect
export type ProjectMembership = typeof projectMemberships.$inferSelect
export type ProjectWithMemberShip = Project & {
  membership: ProjectMembership
}
export type ProjectWithNotes = Project & {
  notes: Note[]
}
export type Task = typeof tasks.$inferSelect
export type Folder = typeof folders.$inferSelect
export type FolderWithSubFolders = Folder & {
  subFolders: Folder[]
}
export type FolderWithNotes = Folder & {
  notes: Note[]
}
export type Note = typeof notes.$inferSelect
export type Block = typeof blocks.$inferSelect

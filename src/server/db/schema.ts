import { init } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
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

export const calendarViewEnum = pgEnum("calendar_view", [
  "day",
  "week",
  "month",
  "year",
  "agenda"
])

export const eventColorEnum = pgEnum("event_color", [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "gray"
])

export const badgeVariantEnum = pgEnum("badge_variant", [
  "dot",
  "colored",
  "mixed"
])

// Calendar event table
export const calendarEvents = createTable("calendar_event", {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  color: eventColorEnum("color").notNull().default("blue"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
})

// Working hours table for users' availability
export const workingHours = createTable("working_hours", {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => createId())
    .primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for days of the week
  fromHour: integer("from_hour").notNull(),
  toHour: integer("to_hour").notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
})

// Calendar settings for users
export const calendarSettings = createTable("calendar_settings", {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => createId())
    .primaryKey(),
  defaultView: calendarViewEnum("default_view").notNull().default("month"),
  defaultBadgeVariant: badgeVariantEnum("default_badge_variant")
    .notNull()
    .default("dot"),
  visibleHoursFrom: integer("visible_hours_from").notNull().default(9),
  visibleHoursTo: integer("visible_hours_to").notNull().default(17),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
})

// Define relations
export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, {
    fields: [calendarEvents.userId],
    references: [users.id]
  })
}))

export const workingHoursRelations = relations(workingHours, ({ one }) => ({
  user: one(users, {
    fields: [workingHours.userId],
    references: [users.id]
  })
}))

export const calendarSettingsRelations = relations(
  calendarSettings,
  ({ one }) => ({
    user: one(users, {
      fields: [calendarSettings.userId],
      references: [users.id]
    })
  })
)

// Types
export type CalendarEvent = typeof calendarEvents.$inferSelect
export type NewCalendarEvent = typeof calendarEvents.$inferInsert

export type WorkingHours = typeof workingHours.$inferSelect
export type NewWorkingHours = typeof workingHours.$inferInsert

export type CalendarSettings = typeof calendarSettings.$inferSelect
export type NewCalendarSettings = typeof calendarSettings.$inferInsert

export type CalendarView = (typeof calendarViewEnum.enumValues)[number]
export type EventColor = (typeof eventColorEnum.enumValues)[number]
export type BadgeVariant = (typeof badgeVariantEnum.enumValues)[number]

import { init } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core"

export const createId = init({
  fingerprint: "tasklytic",
  length: 20
})
export const createTable = pgTableCreator((name) => `tasklytic_${name}`)

export const users = createTable(
  "user",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
  },
  (table) => ({
    // Index for email lookups as recommended by Better Auth
    emailIdx: index("user_email_idx").on(table.email)
  })
)

export const sessions = createTable(
  "session",
  {
    id: varchar("id", { length: 36 })
      .$defaultFn(() => createId())
      .primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    activeOrganizationId: text("active_organization_id").references(
      () => organizations.id
    ),
    userId: text("user_id")
      .notNull()
      .references(() => users.id)
  },
  (table) => ({
    // Index to improve session lookup by user
    userIdIdx: index("session_user_id_idx").on(table.userId),
    // Index for session lookup by token as recommended by Better Auth
    tokenIdx: index("session_token_idx").on(table.token),
    // Index for quickly finding expired sessions
    expiresAtIdx: index("session_expires_at_idx").on(table.expiresAt)
  })
)

export const accounts = createTable(
  "account",
  {
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
  },
  (table) => ({
    // Index to improve account lookup by user as recommended by Better Auth
    userIdIdx: index("account_user_id_idx").on(table.userId),
    // Composite index for looking up accounts by provider and account ID
    providerAccountIdx: index("account_provider_account_idx").on(
      table.providerId,
      table.accountId
    )
  })
)

export const verification = createTable(
  "verification",
  {
    id: varchar("id", { length: 36 })
      .$defaultFn(() => createId())
      .primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at")
  },
  (table) => ({
    // Index for looking up verifications by identifier as recommended by Better Auth
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
    // Index for cleaning up expired verifications
    expiresAtIdx: index("verification_expires_at_idx").on(table.expiresAt)
  })
)

export const organizations = createTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    metadata: text("metadata")
  },
  (table) => ({
    // Index for organization lookup by slug as recommended by Better Auth
    slugIdx: index("organization_slug_idx").on(table.slug)
  })
)

export const members = createTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    createdAt: timestamp("created_at").notNull()
  },
  (table) => ({
    // Index for member lookup by userId as recommended by Better Auth
    userIdIdx: index("member_user_id_idx").on(table.userId),
    // Index for member lookup by organizationId as recommended by Better Auth
    organizationIdIdx: index("member_organization_id_idx").on(
      table.organizationId
    ),
    // Composite index for user's organization memberships
    userOrganizationIdx: index("member_user_organization_idx").on(
      table.userId,
      table.organizationId
    )
  })
)

export const invitations = createTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
  },
  (table) => ({
    // Index for invitation lookup by email as recommended by Better Auth
    emailIdx: index("invitation_email_idx").on(table.email),
    // Index for invitation lookup by organizationId as recommended by Better Auth
    organizationIdIdx: index("invitation_organization_id_idx").on(
      table.organizationId
    ),
    // Composite index for organization's invitations by email
    organizationEmailIdx: index("invitation_organization_email_idx").on(
      table.organizationId,
      table.email
    )
  })
)

// Add passkey table as recommended by Better Auth
export const passkey = createTable(
  "passkey",
  {
    id: varchar("id", { length: 36 })
      .$defaultFn(() => createId())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    credentialId: text("credential_id").notNull().unique(),
    publicKey: text("public_key").notNull(),
    counter: integer("counter").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at")
  },
  (table) => ({
    // Index for passkey lookup by userId as recommended by Better Auth
    userIdIdx: index("passkey_user_id_idx").on(table.userId)
  })
)

// Add twoFactor table as recommended by Better Auth
export const twoFactor = createTable(
  "two_factor",
  {
    id: varchar("id", { length: 36 })
      .$defaultFn(() => createId())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    secret: text("secret").notNull(),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
  },
  (table) => ({
    // Index for twoFactor lookup by secret as recommended by Better Auth
    secretIdx: index("two_factor_secret_idx").on(table.secret)
  })
)

// Calendar

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
export const calendarEvents = createTable(
  "calendar_event",
  {
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
  },
  (table) => ({
    // Index for date range queries - critical for calendar performance
    dateRangeIdx: index("calendar_event_date_range_idx").on(
      table.startDate,
      table.endDate
    ),
    // Index for filtering by user
    userIdIdx: index("calendar_event_user_id_idx").on(table.userId),
    // Composite index for user's events in a date range
    userDateRangeIdx: index("calendar_event_user_date_range_idx").on(
      table.userId,
      table.startDate,
      table.endDate
    ),
    // Index for sorting events by start date
    startDateIdx: index("calendar_event_start_date_idx").on(table.startDate)
  })
)

// Working hours table for users' availability
export const workingHours = createTable(
  "working_hours",
  {
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
  },
  (table) => ({
    // Index for looking up working hours by user
    userIdIdx: index("working_hours_user_id_idx").on(table.userId),
    // Composite index for quickly finding a user's working hours for a specific day
    userDayIdx: index("working_hours_user_day_idx").on(
      table.userId,
      table.dayOfWeek
    )
  })
)

// Calendar settings for users
export const calendarSettings = createTable(
  "calendar_settings",
  {
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
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
  },
  (table) => ({
    // Index for user settings lookups
    userIdIdx: index("calendar_settings_user_id_idx").on(table.userId)
  })
)

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

// Add relations for new tables
export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(users, {
    fields: [passkey.userId],
    references: [users.id]
  })
}))

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(users, {
    fields: [twoFactor.userId],
    references: [users.id]
  })
}))

// Types
export type CalendarEvent = typeof calendarEvents.$inferSelect
export type NewCalendarEvent = typeof calendarEvents.$inferInsert

export type WorkingHours = typeof workingHours.$inferSelect
export type NewWorkingHours = typeof workingHours.$inferInsert

export type CalendarSettings = typeof calendarSettings.$inferSelect
export type NewCalendarSettings = typeof calendarSettings.$inferInsert

export type Passkey = typeof passkey.$inferSelect
export type NewPasskey = typeof passkey.$inferInsert

export type TwoFactor = typeof twoFactor.$inferSelect
export type NewTwoFactor = typeof twoFactor.$inferInsert

export type CalendarView = (typeof calendarViewEnum.enumValues)[number]
export type EventColor = (typeof eventColorEnum.enumValues)[number]
export type BadgeVariant = (typeof badgeVariantEnum.enumValues)[number]

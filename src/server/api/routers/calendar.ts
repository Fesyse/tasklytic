import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  badgeVariantEnum,
  calendarEvents,
  calendarSettings,
  calendarViewEnum,
  eventColorEnum,
  users,
  workingHours
} from "@/server/db/schema"

// Schema for calendar event creation
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  color: z.enum(eventColorEnum.enumValues).default("blue")
})

// Schema for calendar event update
const updateEventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  startDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  color: z.enum(eventColorEnum.enumValues).optional()
})

// Schema for working hours update
const updateWorkingHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  fromHour: z.number().min(0).max(23),
  toHour: z.number().min(0).max(23)
})

// Schema for calendar settings update
const updateCalendarSettingsSchema = z.object({
  defaultView: z.enum(calendarViewEnum.enumValues).optional(),
  defaultBadgeVariant: z.enum(badgeVariantEnum.enumValues).optional(),
  visibleHoursFrom: z.number().min(0).max(23).optional(),
  visibleHoursTo: z.number().min(0).max(23).optional()
})

export const calendarRouter = createTRPCRouter({
  // Get all events for the current user and all other users
  getEvents: protectedProcedure.query(async ({ ctx }) => {
    // Fetch events for all users
    const events = await ctx.db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        description: calendarEvents.description,
        startDate: calendarEvents.startDate,
        endDate: calendarEvents.endDate,
        color: calendarEvents.color,
        userId: calendarEvents.userId,
        user: {
          id: users.id,
          name: users.name,
          image: users.image
        }
      })
      .from(calendarEvents)
      .innerJoin(users, eq(calendarEvents.userId, users.id))

    // Transform to match the expected interface format
    return events.map((event) => ({
      id: Number(event.id),
      title: event.title,
      description: event.description || "",
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      color: event.color,
      user: {
        id: event.user.id,
        name: event.user.name,
        picturePath: event.user.image
      }
    }))
  }),

  // Get a specific event
  getEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [event] = await ctx.db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.id, input.id),
            eq(calendarEvents.userId, ctx.session.user.id)
          )
        )
        .limit(1)

      return event
    }),

  // Create a new event
  createEvent: protectedProcedure
    .input(createEventSchema)
    .mutation(async ({ ctx, input }) => {
      const [event] = await ctx.db
        .insert(calendarEvents)
        .values({
          ...input,
          userId: ctx.session.user.id
        })
        .returning()

      return event
    }),

  // Update an existing event
  updateEvent: protectedProcedure
    .input(updateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const [updatedEvent] = await ctx.db
        .update(calendarEvents)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(calendarEvents.id, id),
            eq(calendarEvents.userId, ctx.session.user.id)
          )
        )
        .returning()

      return updatedEvent
    }),

  // Delete an event
  deleteEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(calendarEvents)
        .where(
          and(
            eq(calendarEvents.id, input.id),
            eq(calendarEvents.userId, ctx.session.user.id)
          )
        )

      return { success: true }
    }),

  // Get working hours for the current user
  getWorkingHours: protectedProcedure.query(async ({ ctx }) => {
    const userWorkingHours = await ctx.db
      .select()
      .from(workingHours)
      .where(eq(workingHours.userId, ctx.session.user.id))

    // Transform to the expected working hours format
    const formattedWorkingHours: Record<number, { from: number; to: number }> =
      {
        0: { from: 0, to: 0 }, // Sunday
        1: { from: 8, to: 17 }, // Monday
        2: { from: 8, to: 17 }, // Tuesday
        3: { from: 8, to: 17 }, // Wednesday
        4: { from: 8, to: 17 }, // Thursday
        5: { from: 8, to: 17 }, // Friday
        6: { from: 0, to: 0 } // Saturday
      }

    // Override defaults with user settings
    userWorkingHours.forEach((hour) => {
      formattedWorkingHours[hour.dayOfWeek] = {
        from: hour.fromHour,
        to: hour.toHour
      }
    })

    return formattedWorkingHours
  }),

  // Update working hours
  updateWorkingHours: protectedProcedure
    .input(z.array(updateWorkingHoursSchema))
    .mutation(async ({ ctx, input }) => {
      // Delete existing working hours
      await ctx.db
        .delete(workingHours)
        .where(eq(workingHours.userId, ctx.session.user.id))

      // Insert new working hours
      if (input.length > 0) {
        await ctx.db.insert(workingHours).values(
          input.map((hour) => ({
            dayOfWeek: hour.dayOfWeek,
            fromHour: hour.fromHour,
            toHour: hour.toHour,
            userId: ctx.session.user.id
          }))
        )
      }

      return { success: true }
    }),

  // Get calendar settings for the current user
  getCalendarSettings: protectedProcedure.query(async ({ ctx }) => {
    const [userSettings] = await ctx.db
      .select()
      .from(calendarSettings)
      .where(eq(calendarSettings.userId, ctx.session.user.id))
      .limit(1)

    // Return default settings if no settings found
    if (!userSettings) {
      return {
        defaultView: "month" as const,
        defaultBadgeVariant: "colored" as const,
        visibleHoursFrom: 7,
        visibleHoursTo: 18
      }
    }

    return {
      defaultView: userSettings.defaultView,
      defaultBadgeVariant: userSettings.defaultBadgeVariant,
      visibleHoursFrom: userSettings.visibleHoursFrom,
      visibleHoursTo: userSettings.visibleHoursTo
    }
  }),

  // Update calendar settings
  updateCalendarSettings: protectedProcedure
    .input(updateCalendarSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if settings exist
      const [existingSettings] = await ctx.db
        .select()
        .from(calendarSettings)
        .where(eq(calendarSettings.userId, ctx.session.user.id))
        .limit(1)

      if (existingSettings) {
        // Update existing settings
        const [updatedSettings] = await ctx.db
          .update(calendarSettings)
          .set({
            ...input,
            updatedAt: new Date()
          })
          .where(eq(calendarSettings.id, existingSettings.id))
          .returning()

        return updatedSettings
      } else {
        // Create new settings
        const [newSettings] = await ctx.db
          .insert(calendarSettings)
          .values({
            ...input,
            userId: ctx.session.user.id
          })
          .returning()

        return newSettings
      }
    }),

  // Get all users for calendar selection
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const allUsers = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        image: users.image
      })
      .from(users)

    // Transform to match the expected interface format
    return allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      picturePath: user.image
    }))
  })
})

import { config } from "dotenv"
config()

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import type { Env } from "@/env"
import type {
  NewCalendarEvent,
  NewCalendarSettings,
  NewWorkingHours
} from "@/server/db/schema"
import * as schema from "@/server/db/schema"

const env = process.env as Env

async function main() {
  // Create a database connection
  const client = new Pool({ connectionString: env.DATABASE_URL })
  const db = drizzle(client, { schema })

  console.log("🌱 Starting database seeding...")

  try {
    // Reset existing calendar data before seeding
    console.log("🧹 Cleaning existing calendar data...")
    await db.delete(schema.calendarEvents)
    await db.delete(schema.workingHours)
    await db.delete(schema.calendarSettings)

    // Get all existing users to reference in our seed data
    const users = await db.select().from(schema.users)

    if (users.length === 0) {
      console.error(
        "❌ No users found in the database. Create some users first."
      )
      process.exit(1)
    }

    // Extract user IDs
    const userIds = users.map((user) => user.id)

    // Generate calendar events manually instead of using drizzle-seed
    console.log("🌱 Seeding calendar data...")

    // Event titles
    const workTitles = [
      "Team Meeting",
      "Weekly Planning",
      "Sprint Review",
      "Client Call",
      "Design Review"
    ]
    const socialTitles = [
      "Lunch with Team",
      "Coffee Break",
      "1:1 Meeting",
      "Project Kickoff",
      "Brainstorming Session"
    ]
    const personalTitles = [
      "Dentist Appointment",
      "Doctor Visit",
      "Gym Session",
      "Vacation Day",
      "Personal Time"
    ]

    // Generate 50 events (10 per user or distributed evenly if fewer users)
    const eventsPerUser = Math.max(
      1,
      Math.min(10, Math.ceil(50 / users.length))
    )
    const totalEvents = users.length * eventsPerUser

    const eventInserts: NewCalendarEvent[] = []

    for (let i = 0; i < totalEvents; i++) {
      // Safely get user ID with fallback to first user
      const userIdIndex = i % userIds.length
      const userId = userIds[userIdIndex] ?? userIds[0]

      if (!userId) {
        console.error("❌ Unexpected error: No valid user ID found")
        process.exit(1)
      }

      const titleCategory = Math.random()

      let title: string
      if (titleCategory < 0.3) {
        const index = Math.floor(Math.random() * workTitles.length)
        title = workTitles[index] ?? "Team Meeting"
      } else if (titleCategory < 0.7) {
        const index = Math.floor(Math.random() * socialTitles.length)
        title = socialTitles[index] ?? "Lunch with Team"
      } else {
        const index = Math.floor(Math.random() * personalTitles.length)
        title = personalTitles[index] ?? "Personal Time"
      }

      // Generate random dates between 30 days ago and 60 days in the future
      const startTime =
        Date.now() + (Math.random() * 90 - 30) * 24 * 60 * 60 * 1000
      const startDate = new Date(startTime)

      // Event duration between 1-3 hours
      const durationHours = Math.floor(Math.random() * 3) + 1
      const endDate = new Date(startTime + durationHours * 60 * 60 * 1000)

      // Random color
      const colorIndex = Math.floor(
        Math.random() * schema.eventColorEnum.enumValues.length
      )
      const color =
        (schema.eventColorEnum.enumValues[colorIndex] as schema.EventColor) ||
        "blue"

      eventInserts.push({
        title,
        description: `Description for ${title}. This is a sample event.`,
        startDate,
        endDate,
        color,
        userId
      })
    }

    // Insert calendar events
    for (const event of eventInserts) {
      await db.insert(schema.calendarEvents).values(event)
    }

    console.log(`✅ Created ${eventInserts.length} calendar events`)

    // Generate working hours for each user (Mon-Fri)
    const workingHoursInserts: NewWorkingHours[] = []

    for (const userId of userIds) {
      if (!userId) continue

      // Working days (1-5 for Monday to Friday)
      for (let day = 1; day <= 5; day++) {
        const fromHour = Math.random() < 0.5 ? 8 : 9
        const toHour = Math.random() < 0.5 ? 17 : 18

        workingHoursInserts.push({
          dayOfWeek: day,
          fromHour,
          toHour,
          userId
        })
      }
    }

    // Insert working hours
    for (const workingHour of workingHoursInserts) {
      await db.insert(schema.workingHours).values(workingHour)
    }

    console.log(`✅ Created ${workingHoursInserts.length} working hour entries`)

    // Generate calendar settings for each user
    const calendarSettingsInserts: NewCalendarSettings[] = []

    for (const userId of userIds) {
      if (!userId) continue

      // Random view - safely get enum value
      const viewIndex = Math.floor(
        Math.random() * schema.calendarViewEnum.enumValues.length
      )
      const defaultView =
        (schema.calendarViewEnum.enumValues[
          viewIndex
        ] as schema.CalendarView) || "month"

      // Random badge variant - safely get enum value
      const badgeIndex = Math.floor(
        Math.random() * schema.badgeVariantEnum.enumValues.length
      )
      const defaultBadgeVariant =
        (schema.badgeVariantEnum.enumValues[
          badgeIndex
        ] as schema.BadgeVariant) || "dot"

      // Random hours
      const visibleHoursFrom = Math.random() < 0.5 ? 8 : 9
      const visibleHoursTo = 17 + Math.floor(Math.random() * 3)

      calendarSettingsInserts.push({
        defaultView,
        defaultBadgeVariant,
        visibleHoursFrom,
        visibleHoursTo,
        userId
      })
    }

    // Insert calendar settings
    for (const setting of calendarSettingsInserts) {
      await db.insert(schema.calendarSettings).values(setting)
    }

    console.log(
      `✅ Created ${calendarSettingsInserts.length} calendar settings`
    )

    console.log("✅ Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    // Close the database connection
    await client.end()
  }
}

// Run the seed function
main().catch((err) => {
  console.error("❌ Fatal error:", err)
  process.exit(1)
})

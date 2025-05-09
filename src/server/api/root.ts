import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc"
import { calendarRouter } from "./routers/calendar"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  calendar: calendarRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

// creates a caller that can be used in RSC-components
export const createCaller = createCallerFactory(appRouter)

import { calendarRouter } from "./calendar"
import { organizationRouter } from "./organization"
import { userRouter } from "./users"

export const router = {
  calendar: calendarRouter,
  users: userRouter,
  organization: organizationRouter
}

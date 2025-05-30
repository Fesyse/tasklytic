import { calendarRouter } from "./calendar"
import { noteRouter } from "./note"
import { organizationRouter } from "./organization"
import { syncRouter } from "./sync"
import { userRouter } from "./users"

export const router = {
  calendar: calendarRouter,
  user: userRouter,
  organization: organizationRouter,
  sync: syncRouter,
  note: noteRouter
}

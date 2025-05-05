import { api } from "@/trpc/server"

export const getEvents = async () => {
  try {
    const events = await api.calendar.getEvents()
    return events
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export const getUsers = async () => {
  try {
    const users = await api.calendar.getUsers()
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

import { type ClassValue, clsx } from "clsx"
import { addMonths, isAfter } from "date-fns"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import { type ProjectWithTasks } from "@/server/db/schema"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function title(string: string) {
  return (string.charAt(0).toUpperCase() + string.slice(1)).replaceAll("-", " ")
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const projectKeys: (keyof ProjectWithTasks)[] = [
  "id",
  "name",
  "userId",
  "createdAt",
  "updatedAt",
  "tasks"
]

function getProjectsFromLocalStorage(): ProjectWithTasks[] {
  if (typeof window === "undefined") return []

  const projects = JSON.parse(
    localStorage.getItem("projects") ?? "[]"
  ) as unknown[]

  if (
    typeof projects === "object" &&
    Array.isArray(projects) &&
    !projects.every(project => {
      if (typeof project !== "object" || !project) return false
      return projectKeys.every(key => key in project)
    })
  ) {
    toast.error("Your local saved projects has been corrupted or deleted!")
    return []
  }

  if (typeof projects === "undefined") return []
  // above we checked that project is typeof Project
  else return projects as ProjectWithTasks[]
}

function checkIsSubscriptionExpired(subscriptionEndDate: Date): boolean {
  return isAfter(addMonths(new Date(), 1), subscriptionEndDate)
}

export {
  cn,
  title,
  random,
  sleep,
  getProjectsFromLocalStorage,
  checkIsSubscriptionExpired
}

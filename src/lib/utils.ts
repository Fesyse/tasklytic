import { type ClassValue, clsx } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import { Project } from "@/server/db/schema"

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

const projectKeys: (keyof Project)[] = [
  "id",
  "name",
  "userId",
  "createdAt",
  "updatedAt"
]

function getProjectsFromLocalStorage(): Project[] {
  const projects = JSON.parse(
    localStorage.getItem("guest-projects") ?? "[]"
  ) as unknown[]

  if (
    typeof projects === "object" &&
    Array.isArray(projects) &&
    !projects.every(project => {
      if (typeof project !== "object" || !project) return
      projectKeys.every(key => key in project)
    })
  ) {
    toast.error("Your local saved projects has been corrupted or deleted!")
    return []
  }

  if (typeof projects === "undefined") return []
  // above we checked that project is typeof Project
  else return projects as Project[]
}

export { cn, title, random, sleep, getProjectsFromLocalStorage }

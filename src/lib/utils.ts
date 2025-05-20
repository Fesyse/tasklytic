import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function title(str: string) {
  return str.at(0)?.toUpperCase() + str.slice(1)
}

export function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) return parts.pop()?.split(";").shift()
}

type Success<T> = {
  data: T
  error: null
}

type Failure<E> = {
  data: null
  error: E
}

type Result<T, E = Error> = Success<T> | Failure<E>

export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function getEmojiSlug(emojiLabel: string) {
  return emojiLabel.replaceAll(" ", "-").toLowerCase()
}

export function getLabelFromSlug(emojiSlug: string) {
  return emojiSlug.replaceAll("-", " ")
}

export function getEmojiUrl(emojiLabel: string) {
  return `${getBaseUrl()}/api/emoji/${getEmojiSlug(emojiLabel)}`
}

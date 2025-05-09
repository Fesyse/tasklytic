import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function title(str: string) {
  return str.at(0)?.toUpperCase() + str.slice(1)
}

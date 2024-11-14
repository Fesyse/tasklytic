import { isCuid as isCuid2 } from "@paralleldrive/cuid2"
import { type ClassValue, clsx } from "clsx"
import { addMonths, isAfter } from "date-fns"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

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

function checkIsSubscriptionExpired(subscriptionEndDate: Date): boolean {
  return isAfter(subscriptionEndDate, addMonths(new Date(), 1))
}

function isCuid(string: string) {
  if (string.length !== 20) return false

  return isCuid2(string)
}

type ClipboardOptions = {
  toast?: boolean
}

async function copyToClipboard(text: string, options?: ClipboardOptions) {
  try {
    await navigator.clipboard.writeText(text)
    if (options?.toast) toast.success("Copied to clipboard")
  } catch {
    if (options?.toast) toast.error("Failed to copy to clipboard")
  }
}

function openInNewTab(url: string) {
  window.open(url, "_blank")
}

export {
  checkIsSubscriptionExpired,
  cn,
  copyToClipboard,
  isCuid,
  openInNewTab,
  random,
  sleep,
  title
}

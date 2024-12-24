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
  toastText?: string
  toastErrorText?: string
}

async function copyToClipboard(text: string, options?: ClipboardOptions) {
  try {
    await navigator.clipboard.writeText(text)
    if (options?.toast)
      toast.success(options?.toastText ?? "Copied to clipboard")
  } catch {
    if (options?.toast)
      toast.error(options?.toastErrorText ?? "Failed to copy to clipboard")
  }
}

function openInNewTab(url: string) {
  window.open(url, "_blank")
}

function importFile(onLoad: (reader: FileReader) => void) {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".taly"

  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => onLoad(reader)
    reader.readAsText(file)
  }
  input.click()
}

function exportFile(text: string | Blob, fileName: string) {
  const element = document.createElement("a")
  const file = new Blob([text], { type: "text/plain" })
  element.href = URL.createObjectURL(file)
  element.download = fileName
  document.body.appendChild(element) // Required for this to work in FireFox
  element.click()

  element.remove()
}

function isNotePage(pathname: string) {
  const splittedPathname = pathname.split("/").slice(1)

  const projectPath = splittedPathname[0]
  const projectId = splittedPathname[1]
  const notePath = splittedPathname[2]
  const noteId = splittedPathname[3]

  return (
    projectPath === "projects" && projectId && notePath === "note" && noteId
  )
}

export {
  checkIsSubscriptionExpired,
  cn,
  copyToClipboard,
  exportFile,
  importFile,
  isCuid,
  isNotePage,
  openInNewTab,
  random,
  sleep,
  title
}

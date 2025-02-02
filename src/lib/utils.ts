import { isCuid as isCuid2 } from "@paralleldrive/cuid2"
import { type ClassValue, clsx } from "clsx"
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

function searchQueryFormat(str: string) {
  return "%" + str.split("").join("%") + "%"
}

export {
  cn,
  copyToClipboard,
  exportFile,
  importFile,
  isCuid,
  openInNewTab,
  random,
  searchQueryFormat,
  sleep,
  title
}

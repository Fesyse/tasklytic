const NAVIGATION_MENU = ["sidebar", "floating-dock"] as const
const TASK_STATUS = ["completed", "in-progress", "to-do"] as const
const MAX_FILE_SIZE = {
  string: "1MB",
  number: 2 ** 20
} as const
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]

export { NAVIGATION_MENU, TASK_STATUS, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES }

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

const PROJECT_PLANS = ["Free", "Pro", "Enterprise"] as const

export { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE, PROJECT_PLANS, TASK_STATUS }

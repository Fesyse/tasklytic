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

const PROJECT_PLANS = ["Free", "Startup", "Enterprise"] as const
const MAX_PROJECTS = 3
const MAX_PROJECTS_WITH_SUBSCRIPTION = 10

export {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_PROJECTS,
  MAX_PROJECTS_WITH_SUBSCRIPTION,
  PROJECT_PLANS,
  TASK_STATUS
}

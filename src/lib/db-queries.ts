import type { Organization } from "better-auth/plugins/organization"

import type { User } from "better-auth"

import { createId } from "@/server/db/schema"
import { dexieDB } from "./db-client"
import { tryCatch } from "./utils"

export function createNote(data: { user: User; organization: Organization }) {
  return tryCatch(
    dexieDB.notes.add({
      id: createId(),
      title: "",
      emoji: undefined,
      isPublic: false,
      updatedAt: new Date(),
      updatedByUserId: data.user.id,
      createdByUserId: data.user.id,
      createdAt: new Date(),
      organizationId: data.organization.id
    })
  )
}

export function deleteNote(id: string) {
  return tryCatch(dexieDB.notes.delete(id))
}

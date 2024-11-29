import { type DeepPartial } from "@/types/utils"
import React from "react"
import { createStore } from "zustand/vanilla"

export type NoteToolbarStore = {
  toolbar: React.ReactElement | undefined
}

export const defaultInitState = {
  toolbar: undefined
} satisfies DeepPartial<NoteToolbarStore>

export const createNoteToolbarStore = (initState = defaultInitState) => {
  return createStore(() => initState)
}

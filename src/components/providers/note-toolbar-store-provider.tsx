"use client"

import {
  type NoteToolbarStore,
  createNoteToolbarStore
} from "@/stores/note-toolbar.store"
import { createContext, useContext, useRef } from "react"
import { useStore } from "zustand"

export type NoteToolbarStoreApi = ReturnType<typeof createNoteToolbarStore>

export const NoteToolbarStoreContext = createContext<
  NoteToolbarStoreApi | undefined
>(undefined)

export const NoteToolbarStoreProvider = ({
  children
}: React.PropsWithChildren) => {
  const storeRef = useRef<NoteToolbarStoreApi>(null)
  if (!storeRef.current) {
    storeRef.current = createNoteToolbarStore()
  }

  return (
    <NoteToolbarStoreContext.Provider value={storeRef.current}>
      {children}
    </NoteToolbarStoreContext.Provider>
  )
}

export const useNoteToolbarStore = <T,>(
  selector: (store: NoteToolbarStore) => T
): T => {
  const context = useContext(NoteToolbarStoreContext)

  if (!context) {
    throw new Error(
      `useNoteToolbarStore must be used within NoteToolbarStoreProvider`
    )
  }

  return useStore(context, selector)
}

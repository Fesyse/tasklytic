"use client"

import { type ReactNode, createContext, useContext, useRef } from "react"
import { useStore } from "zustand"
import {
  type NoteEditorStore,
  createNoteEditorStateStore
} from "@/lib/stores/note-editor-state.store"

export type NoteEditorStateApi = ReturnType<typeof createNoteEditorStateStore>

export const NoteEditorStateContext = createContext<
  NoteEditorStateApi | undefined
>(undefined)

export interface NoteEditorStateProviderProps {
  children: ReactNode
}

export const NoteEditorStateProvider = ({
  children
}: NoteEditorStateProviderProps) => {
  const storeRef = useRef<NoteEditorStateApi | null>(null)
  if (!storeRef.current) {
    storeRef.current = createNoteEditorStateStore()
  }

  return (
    <NoteEditorStateContext.Provider value={storeRef.current}>
      {children}
    </NoteEditorStateContext.Provider>
  )
}

export const useNoteEditorState = <T,>(
  selector: (store: NoteEditorStore) => T
): T => {
  const noteEditorStateContext = useContext(NoteEditorStateContext)

  if (!noteEditorStateContext) {
    throw new Error(
      `useNoteEditorState must be used within NoteEditorStateProvider`
    )
  }

  return useStore(noteEditorStateContext, selector)
}

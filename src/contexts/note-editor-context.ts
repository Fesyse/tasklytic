import React, { createContext, useContext } from "react"

type NoteEditorContextType = {
  isSaving: boolean
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  isAutoSaving: boolean
  setIsAutoSaving: React.Dispatch<React.SetStateAction<boolean>>
  isChanged: boolean
  setIsChanged: React.Dispatch<React.SetStateAction<boolean>>
}

export const NoteEditorContext = createContext<NoteEditorContextType | null>(
  null
)

export const NoteEditorProvider = NoteEditorContext.Provider

export const useNoteEditorContext = () => {
  const context = useContext(NoteEditorContext)
  if (!context) {
    throw new Error("useNoteEditor must be used within a NoteEditorProvider")
  }
  return context
}

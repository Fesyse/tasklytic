import { createStore } from "zustand/vanilla"

export type NoteEditorState = {
  saved: boolean
}

export type NoteEditorActions = {
  setState: (state: NoteEditorState) => void
  toggleSaved: () => void
}

export type NoteEditorStore = NoteEditorState & NoteEditorActions

export const defaultInitState: NoteEditorState = {
  saved: true
}

export const createNoteEditorStateStore = (
  initState: NoteEditorState = defaultInitState
) => {
  return createStore<NoteEditorStore>()(set => ({
    ...initState,
    setState: state => set(state),
    toggleSaved: () => set(state => ({ ...state, saved: !state.saved }))
  }))
}

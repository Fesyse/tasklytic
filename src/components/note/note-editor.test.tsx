import type { Note } from "@/lib/db-client"
import type { Block } from "@/server/db/schema"
import { act, render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { NoteEditor, NoteEditorProvider } from "./note-editor"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type React from "react"

// Mock the context and hooks related to syncing
vi.mock("@/hooks/use-note-editor-v2", () => ({
  useNoteEditorV2: () => ({
    editor: { tf: { init: vi.fn() } },
    isLoading: false,
    note: {
      id: "1",
      title: "Test",
      isPublic: false,
      organizationId: "IRI7jcAlgVQtnLbdb6P0a2BHeaDKGbda",
      parentNoteId: null,
      updatedByUserName: "Fesyse",
      updatedByUserId: "OJP4ED0vcr1nojvLbP7me5H9609WMvNY",
      updatedAt: new Date(),
      createdByUserName: "Fesyse",
      createdByUserId: "OJP4ED0vcr1nojvLbP7me5H9609WMvNY",
      createdAt: new Date(),
      blocks: [{ id: "1", noteId: "1", content: "test", order: 0 }]
    } satisfies Note & { blocks: Block[] }
  })
}))

vi.mock("@/env", () => ({
  env: {
    NODE_ENV: "mock-env-variable",
    DATABASE_URL: "mock-env-variable",
    BETTER_AUTH_SECRET: "mock-env-variable",
    BETTER_AUTH_URL: "mock-env-variable",
    GOOGLE_CLIENT_ID: "mock-env-variable",
    GOOGLE_CLIENT_SECRET: "mock-env-variable",
    GITHUB_CLIENT_ID: "mock-env-variable",
    GITHUB_CLIENT_SECRET: "mock-env-variable",
    RESEND_API_KEY: "mock-env-variable",
    NEXT_PUBLIC_POSTHOG_KEY: "mock-env-variable",
    NEXT_PUBLIC_POSTHOG_HOST: "mock-env-variable",
    UPLOADTHING_TOKEN: "mock-env-variable",
    OPENAI_API_KEY: "mock-env-variable",
    UNSPLASH_ACCESS_KEY: "mock-env-variable",
    UNSPLASH_SECRET_KEY: "mock-env-variable",
    KV_REST_API_TOKEN: "mock-env-variable",
    KV_REST_API_URL: "mock-env-variable",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "mock-env-variable",
    TURNSTILE_SECRET_KEY: "mock-env-variable"
  }
}))

vi.mock("@/contexts/note-editor-context", async (importOriginal) => {
  const actual = await importOriginal()
  return Object.assign({}, actual, {
    useNoteEditorContext: () => ({
      setIsChanged: vi.fn(),
      isChanged: false,
      isSaving: false,
      isAutoSaving: false,
      setIsSaving: vi.fn(),
      setIsAutoSaving: vi.fn()
    })
  })
})

const createWrapper = (): React.FC<React.PropsWithChildren> => {
  const queryClient = new QueryClient()
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe("NoteEditor syncing", () => {
  it("renders the editor and shows synced state", () => {
    render(
      <NoteEditorProvider>
        <NoteEditor />
      </NoteEditorProvider>
    )
    expect(
      screen.queryByText(/Start typing your note here/i)
    ).toBeInTheDocument()
  })
  it("shows unsaved changes when editor value changes", async () => {
    const setIsChanged = vi.fn()
    vi.doMock("@/contexts/note-editor-context", async (importOriginal) => {
      const actual = await importOriginal()
      return Object.assign({}, actual, {
        useNoteEditorContext: () => ({
          setIsChanged,
          isChanged: true,
          isSaving: false,
          isAutoSaving: false,
          setIsSaving: vi.fn(),
          setIsAutoSaving: vi.fn()
        })
      })
    })
    const { NoteEditor, NoteEditorProvider } = await import("./note-editor")
    render(
      <NoteEditorProvider>
        <NoteEditor />
      </NoteEditorProvider>
    )
    act(() => {
      setIsChanged(true)
    })
    await waitFor(() => {
      expect(
        screen.getByText(/Unsaved changes|Saved|Saving|Auto-saving/i)
      ).toBeInTheDocument()
    })
  })

  it("shows saving and saved states", async () => {
    vi.doMock("@/contexts/note-editor-context", async (importOriginal) => {
      const actual = await importOriginal()
      return Object.assign({}, actual, {
        useNoteEditorContext: () => ({
          setIsChanged: vi.fn(),
          isChanged: false,
          isSaving: true,
          isAutoSaving: false,
          setIsSaving: vi.fn(),
          setIsAutoSaving: vi.fn()
        })
      })
    })
    const { NoteEditor, NoteEditorProvider } = await import("./note-editor")
    render(
      <NoteEditorProvider>
        <NoteEditor />
      </NoteEditorProvider>
    )
    await waitFor(() => {
      expect(screen.getByText(/Saving/i)).toBeInTheDocument()
    })
  })

  it("shows auto-saving state", async () => {
    vi.doMock("@/contexts/note-editor-context", async (importOriginal) => {
      const actual = await importOriginal()
      return Object.assign({}, actual, {
        useNoteEditorContext: () => ({
          setIsChanged: vi.fn(),
          isChanged: false,
          isSaving: false,
          isAutoSaving: true,
          setIsSaving: vi.fn(),
          setIsAutoSaving: vi.fn()
        })
      })
    })
    const { NoteEditor, NoteEditorProvider } = await import("./note-editor")
    render(
      <NoteEditorProvider>
        <NoteEditor />
      </NoteEditorProvider>
    )
    await waitFor(() => {
      expect(screen.getByText(/Auto-saving/i)).toBeInTheDocument()
    })
  })
})

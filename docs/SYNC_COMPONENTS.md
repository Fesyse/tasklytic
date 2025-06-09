# Sync Components, Hooks, and Services

This document provides a technical reference for all synchronization-related components, hooks, and services in the codebase. It is intended for developers who need to understand or extend the sync layer.

---

## 1. Core Sync Service

### `src/lib/sync-service.ts`

- **`SyncService` class**: Central service for all sync operations between the client (Dexie) and server (Drizzle).
  - **Singleton pattern**: Ensures a single instance per app session.
  - **Responsibilities**:
    - Sync notes, blocks, discussions, and comments (batch and single operations)
    - Conflict resolution (server is source of truth)
    - Throttling and status tracking
    - Full sync (`syncAll`), partial sync, and pull-from-server
  - **Key methods**:
    - `syncNotes(organizationId)`
    - `syncBlocksBatch(noteIds)`
    - `syncDiscussionsBatch(noteIds)`
    - `syncCommentsBatch(discussionIds)`
    - `syncAll(noteId)`
    - `pullNoteFromServer(noteId, organizationId)`

---

## 2. Local Database (Dexie)

### `src/lib/db-client.ts`

- **Tables**: `notes`, `blocks`, `discussions`, `comments`
- **Mirrors server schema** for offline/fast access
- **Used by**: SyncService, hooks, and UI components

### `src/lib/db-queries.ts`

- **Helper functions** for CRUD operations on Dexie tables
- **Used by**: SyncService and hooks

---

## 3. Sync Hooks

### `src/hooks/use-sync.ts`

- **`useSync`**: Main hook for interacting with the sync service
  - Exposes sync status, last sync time, and sync actions (`syncNow`, `syncNotes`, `pullNoteFromServer`)
  - Handles periodic background sync and mutex for concurrent syncs
- **`useSyncedNote`**: Observes a single note and its blocks, auto-syncs if missing
- **`useSyncedNotes`**: Observes all notes for an organization, auto-syncs if missing

### `src/hooks/use-sync-queries.ts`

- **`useSyncedNoteQueries(noteId)`**: CRUD and sync for a single note and its blocks
- **`useSyncedOrganizationNotes(organizationId)`**: CRUD and sync for all notes in an org
- **`useSyncedDiscussions(noteId)`**: CRUD and sync for discussions/comments on a note
- **Debounced sync**: Prevents excessive syncs on rapid changes

---

## 4. UI Components

- **Note-related components** (`src/components/note/`, `src/components/editor/`):
  - Use the above hooks to read/write data and trigger syncs
  - UI updates immediately on local changes; sync is handled in the background

---

## 5. tRPC Endpoints (Server API)

- **Sync endpoints** (see SYNC_LAYER.md for details):
  - `syncNotes`, `syncBlocks`, `syncDiscussions`, `syncComments`
  - `getNotes`, `getBlocks`, `getDiscussions`, `getComments`
- **Used by**: SyncService via `apiVanilla`

---

## 6. Sync Context/Provider

- **SyncProvider** (see SYNC_LAYER.md):
  - Wraps the app to provide sync status and actions via React context
  - Used by hooks and components for global sync state

---

## 7. Error Handling & Status

- **Sync status**: `idle`, `syncing`, `error`, `success` (tracked in SyncService and exposed via hooks)
- **Error handling**: Errors are caught, logged, and surfaced to the UI via hooks
- **Throttling**: Prevents duplicate or too-frequent syncs

---

## 8. How It All Connects

- UI components use hooks (e.g., `useSyncedNote`) to read/write data
- Hooks update Dexie (local DB) and trigger syncs
- SyncService batches and sends changes to the server, pulls updates, and resolves conflicts
- tRPC endpoints handle server-side logic
- Sync status and errors are surfaced to the UI for feedback

---

## See Also

- [SYNC_LAYER.md](./SYNC_LAYER.md): High-level sync architecture and workflow
- `src/lib/sync-service.ts`, `src/hooks/use-sync.ts`, `src/hooks/use-sync-queries.ts` for implementation details

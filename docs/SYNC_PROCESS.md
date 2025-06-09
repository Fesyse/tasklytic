# Sync Process: Dashboard & Note Pages

This document describes the full synchronization process for the main pages of the app:

- `/dashboard` (notes list)
- `/dashboard/note/[noteId]` (single note editor)

It covers what triggers sync, what gets synced, how conflicts are resolved, how the UI updates, and how errors are handled.

---

## 1. `/dashboard` Page: Notes List Sync

### When Sync Happens

- **On page load:**
  - The `DashboardLayout` mounts a utility component (`DashboardSync`).
  - As soon as an active organization is detected, it calls `syncNow()` from the `useSync` hook.
- **Periodically:**
  - Every 5 minutes, a background sync is triggered.
- **On certain user actions:**
  - Creating, deleting, or favoriting a note may also trigger a sync.

### What Gets Synced

- **Notes:**
  - All notes for the current organization are sent to the server.
  - The server compares each note (using `updatedAt` and other fields) and returns the authoritative list.
  - Local Dexie DB is updated to match the server (notes are upserted or deleted as needed).
- **Blocks, Discussions, Comments:**
  - For each note, all related blocks, discussions, and comments are also synced in batches.

### Conflict Resolution

- The **server is always the source of truth**.
- If both local and server have changes, the server's version is used.
- The `updatedAt` field is used to determine which version is newer when merging.

### UI Update

- The UI always reads from the local Dexie DB.
- As soon as sync completes and Dexie is updated, the UI (note list, etc.) automatically reflects the latest data.

### Error Handling

- Sync errors are caught and surfaced to the UI (e.g., via toast notifications).
- The UI remains responsive; another sync will be attempted later.

---

## 2. `/dashboard/note/[noteId]` Page: Single Note Sync

### When Sync Happens

- **On page load:**
  - The note editor uses hooks like `useSyncedNote` and `useSyncedNoteQueries`.
  - If the note is not found in the local DB, it is fetched from the server and stored locally.
- **On edit:**
  - Any change (title, emoji, content block, etc.) is written to Dexie immediately.
  - A sync is triggered (sometimes debounced for performance).
- **On manual action:**
  - The user or code can trigger a manual sync (e.g., via a "refresh" button).
- **Periodically:**
  - The same periodic sync (every 5 minutes) applies here as well.

### What Gets Synced

- **The current note:**
  - All fields (title, emoji, cover, etc.) are synced.
- **Blocks:**
  - All content blocks for the note are synced.
- **Discussions & Comments:**
  - All discussions and comments for the note are synced.

### Conflict Resolution

- The **server is always the source of truth**.
- If both local and server have changes, the server's version is used.
- The `updatedAt` field is used to determine which version is newer when merging.

### UI Update

- The UI (note editor, block list, etc.) always reads from Dexie.
- As soon as sync completes and Dexie is updated, the UI automatically reflects the latest data.
- If a note is missing locally, it is fetched from the server and shown in the UI.

### Error Handling

- Sync errors are caught and surfaced to the UI (e.g., via toast notifications).
- The UI remains responsive; another sync will be attempted later.

---

## 3. General Sync Flow (Both Pages)

| Step                | What Happens                                                                  |
| ------------------- | ----------------------------------------------------------------------------- |
| Page Load           | Sync is triggered (all notes or specific note)                                |
| Notes/Blocks Sync   | Local data sent to server, server returns authoritative list (by `updatedAt`) |
| Conflict Resolution | Server always wins, `updatedAt` used for merging                              |
| UI Update           | UI auto-updates from Dexie after sync                                         |
| Periodic Sync       | Runs every 5 minutes in background                                            |
| Error Handling      | Errors shown in UI, retries on next sync                                      |

---

## 4. Developer Notes

- The sync process is handled by the `SyncService` and hooks in `src/hooks/use-sync.ts` and `src/hooks/use-sync-queries.ts`.
- The UI always reads from Dexie, which is kept in sync with the server.
- All sync operations are batched and optimized for performance.
- The server is the source of truth for all data.

---

## See Also

- [SYNC_LAYER.md](./SYNC_LAYER.md): High-level sync architecture and workflow
- [SYNC_COMPONENTS.md](./SYNC_COMPONENTS.md): Technical reference for all sync-related code

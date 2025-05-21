# Dexie Client DB and Drizzle Server DB Synchronization Layer

This document describes the synchronization layer between a client-side Dexie DB (IndexedDB) and a server-side Drizzle ORM database.

## Architecture Overview

The synchronization layer follows these design principles:

1. **Server as the source of truth**: The server database is considered the authoritative data source. If data conflicts occur, server data takes precedence.
2. **Fast initial rendering**: Client-side data is used for initial rendering to provide a responsive experience.
3. **Background synchronization**: Data is synchronized in the background after initial render.
4. **Automatic sync on changes**: When client data changes, it's automatically synced to the server.
5. **Bidirectional sync**: Changes are synchronized in both directions.

## Components

### 1. Database Schemas

#### Server-side (Drizzle ORM)

We've defined these tables in the Drizzle schema:

- `notes`: Stores note documents
- `blocks`: Stores content blocks within notes
- `discussions`: Stores discussions related to specific blocks
- `comments`: Stores comments within discussions

#### Client-side (Dexie DB)

Mirrors the server schema with these tables:

- `notes`
- `blocks`
- `discussions`
- `comments`

### 2. tRPC Endpoints

The synchronization API includes these endpoints:

**GET Operations**:

- `getNotes`: Fetch notes for an organization
- `getBlocks`: Fetch blocks for a note
- `getDiscussions`: Fetch discussions for a note
- `getComments`: Fetch comments for a discussion

**SYNC Operations**:

- `syncNotes`: Synchronize notes for an organization
- `syncBlocks`: Synchronize blocks for a note
- `syncDiscussions`: Synchronize discussions for a note
- `syncComments`: Synchronize comments for a discussion

### 3. Client-Side Synchronization Context

The `SyncContext` provides:

- Sync status tracking
- Sync timestamp tracking
- Initial data loading
- Periodic background sync
- Change-triggered sync

### 4. Hooks for Component Integration

**For Notes**:

- `useSyncedNote`: Hook to load a note with blocks, with auto-synchronization
- `useSyncedNotes`: Hook to load all notes for an organization, with auto-synchronization

## Workflow Examples

### First Load (No Client Data)

1. App checks client DB for notes
2. If empty, it fetches data from server
3. Data is stored in client DB
4. UI renders from client DB

### Regular Page Load

1. UI immediately renders from client DB
2. In the background, sync runs to update client DB
3. If changes are detected, UI automatically updates

### Client Data Changes

1. Data is updated in client DB
2. UI updates immediately
3. Changes are automatically synced to server

## Implementation Details

### Sync Logic

For each entity type (notes, blocks, etc.):

1. **GET**: Fetch data for a specific scope (org, note, etc.)
2. **UPDATE**: Send client changes to server
   - Server checks for conflicts
   - For new items, server adds them
   - For existing items, server updates if client version is newer
3. **DELETE**: Remove items no longer present in the valid source

### Error Handling

- Sync errors are caught and logged
- UI remains responsive even during sync errors
- Retry mechanism with exponential backoff for failed syncs

## How to Use

1. Wrap your application with the `SyncProvider`:

```tsx
function MyApp({ Component, pageProps }) {
  return (
    <SyncProvider>
      <Component {...pageProps} />
    </SyncProvider>
  )
}
```

2. Use the provided hooks in your components:

```tsx
function NoteEditor({ noteId }) {
  const { note, blocks, isLoading, syncWithServer } = useSyncedNote(noteId)

  // Use note and blocks data for your UI
  // Call syncWithServer() to manually trigger a sync if needed

  return (
    // Your component JSX
  )
}
```

## Testing

Test the sync layer with these scenarios:

1. **Initial load**: Empty client DB should load from server
2. **Conflict resolution**: Server data should win when conflicts occur
3. **Offline changes**: Client changes should sync when online
4. **Simultaneous updates**: Changes from multiple sources should merge properly

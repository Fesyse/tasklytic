# Tasklytic

A modern, Notion-inspired productivity platform for teams and individuals. Tasklytic combines collaborative note-taking, a powerful block-based editor, hierarchical organization, calendar management, and real-time sync between devices. Built with Next.js, TypeScript, tRPC, Drizzle ORM, and a rich set of UI and developer tools.

![Tasklytic](https://72lgp4tw00.ufs.sh/f/431kVQKHrXwBLrAHNx4TpOrdowfxU8skQteZWKcYhyXvLgNn)

---

## Tech Stack

- Next.js 15 (App Router, SSR, API routes)
- React 19
- TypeScript
- tRPC (end-to-end typesafe API)
- Drizzle ORM (PostgreSQL)
- Dexie (IndexedDB, offline-first client DB)
- Tailwind CSS
- Zod (validation)
- Plate (block-based rich text editor)
- React DnD (drag-and-drop)
- React Hook Form
- Playwright, Vitest (testing)
- Shadcn UI, Radix UI
- Better Auth (authentication)
- Resend (email)
- i18n (Next-Intl)

## Features

- **Block-based Editor**: Rich text, headings, lists, to-dos, toggles, code, tables, callouts, equations, media, and more.
- **Hierarchical Notes**: Nested pages, favorites, private/shared/public notes, emoji covers, and drag-and-drop reordering.
- **Real-time Sync**: Bidirectional sync between client (Dexie) and server (Drizzle) with conflict resolution.
- **Collaborative Discussions**: Inline comments, discussions, and suggestions on any block.
- **Calendar Module**: Multi-view calendar (day, week, month, year, agenda), event management, working hours, and user-specific filters.
- **Organization & Permissions**: Multi-organization support, invitations, roles, and sharing.
- **Settings**: Per-user and per-organization preferences, security, and profile management.
- **Offline Support**: Instant load and editing, background sync, and conflict handling.
- **Internationalization**: Multi-language support.
- **Responsive Design**: Works on all devices.

## Project Structure

```
src/
├── app/                # Next.js app directory (routing, layouts, pages)
│   └── dashboard/      # Main workspace: notes, calendar, etc.
│       ├── note/       # Note pages, dynamic routing by noteId
│       └── (calendar)/calendar/ # Calendar module (views, settings)
├── calendar/           # Calendar module (components, contexts, types)
├── components/         # Shared and UI components (editor, note, layouts, etc.)
├── contexts/           # React context providers (note editor, etc.)
├── hooks/              # Custom hooks (sync, note, editor, etc.)
├── i18n/               # Internationalization
├── lib/                # Core libraries (db, sync, site config, utils)
├── server/             # API, db, and backend logic
│   ├── api/routers/    # tRPC routers (note, calendar, sync, org, user)
│   └── db/             # Drizzle schema and seed
├── styles/             # Global styles
├── trpc/               # tRPC setup
```

## Deep Dive: Architecture

### 1. Block-Based Editor

- Built on Plate, supporting a wide range of block types: text, headings, lists, to-dos, toggles, code, tables, callouts, equations, media, and more.
- Slash command menu for inserting blocks (`/` menu).
- Drag-and-drop reordering of blocks.
- Inline comments, discussions, and suggestions on any block.
- Real-time collaborative editing (with local-first UX).

### 2. Notes & Hierarchy

- Notes are hierarchical (can nest infinitely).
- Each note can have an emoji, cover, and metadata.
- Notes can be favorited, shared, or kept private.
- Sidebar navigation groups notes by favorites, private, and shared.
- Dynamic routing: `/dashboard/note/[noteId]`.

### 3. Real-Time Sync Layer

- **Client DB**: Dexie (IndexedDB) mirrors server schema for notes, blocks, discussions, comments.
- **Server DB**: Drizzle ORM (PostgreSQL) is the source of truth.
- **Sync Service**: Bidirectional, background sync with conflict resolution (server wins).
- **Hooks**: `useSync`, `useSyncedNote`, `useSyncedNotes` for seamless data flow.
- **Offline-first**: UI loads instantly from client DB, syncs in background.

### 4. Calendar Module

- Multi-view calendar: day, week, month, year, agenda.
- Event management: create, edit, delete, drag-and-drop rescheduling.
- Working hours and user-specific filters.
- Calendar settings per user.
- Dynamic routing: `/dashboard/(calendar)/calendar/[view]`, `/dashboard/(calendar)/calendar/settings`.

### 5. Organizations & Permissions

- Multi-organization support.
- Invite users, manage roles, and share notes/calendars.
- Organization switcher in sidebar.

### 6. API Layer

- tRPC routers for notes, blocks, calendar, sync, organization, and user.
- End-to-end typesafe API.
- All mutations and queries validated with Zod.

### 7. Authentication & Security

- Better Auth for secure, multi-provider authentication.
- Per-organization and per-user permissions.
- Email verification and notifications via Resend.

### 8. Settings & Customization

- User and organization settings: profile, preferences, security.
- Calendar and note settings.
- Theme switching (light/dark/system).

### 9. Internationalization

- Next-Intl for multi-language support.
- All UI strings are translatable.

## Getting Started

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in the values.

```bash
cp .env.example .env
```

### 2. Install Dependencies

```
pnpm install
```

### 3. Database Setup

Push schema and seed data:

```
pnpm db:setup
```

- To run migrations only: `pnpm db:push`
- To open Drizzle Studio: `pnpm db:studio`

### 4. Development

Start the development server:

```
pnpm dev
```

### 5. Build

Build for production:

```
pnpm build
```

Preview production build:

```
pnpm preview
```

### 6. Lint, Format, and Typecheck

```
pnpm lint
pnpm format:check
pnpm typecheck
```

### 7. Testing

- Unit tests: `pnpm vitest`
- E2E tests: `pnpm playwright`

## Customization

- Add new block types in `src/components/editor/plugins/`.
- Extend note or block schema in `src/server/db/schema.ts`.
- Add new modules or features in `src/components/` or `src/app/`.
- Update sidebar navigation in `src/lib/sidebar.tsx`.

## Contribution Guidelines

- Fork the repo and create a feature branch.
- Follow the code style (see Prettier and ESLint configs).
- Use types instead of interfaces.
- Do not write comments in code.
- Submit a pull request with a clear description.

## License

MIT

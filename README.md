# Tasklytic

## Features

- [x] Projects
  - [x] Create
  - [x] Delete
  - [x] Update
- [] Notes
  - [x] Markdown editor
  - [x] AI integration
  - [] Collaboration
- [] Subscriptions

## Tech stack

- Next.js
- React
- Tailwind CSS
- tRPC
- PostgreSQL
- Auth.js (NextAuth.js)
- Drizzle ORM
- Uploadthing
- Pusher
- OpenAI

## Getting started (self-hosted)

### 1. Clone the repo

```bash
git clone https://github.com/taskly-dev/tasklytic.git
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Create a PostgreSQL database

```bash
psql
```

Create a new database:

```sql
CREATE DATABASE tasklytic;
```

Create a new user:

```sql
CREATE USER tasklytic WITH PASSWORD 'password';
```

Grant privileges to the user:

```sql
GRANT ALL PRIVILEGES ON DATABASE tasklytic TO tasklytic;
```

Exit the psql shell:

```sql
\q
```

### 4. Create a .env file

Copy the `.env.example` file to `.env` and fill in the values:

```bash
cp .env.example .env
```

### 5. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`.

Or build and start the app in production mode:

```bash
pnpm build
pnpm start
```

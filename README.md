# FlashcardsAI

A clean, secure flashcard web app built with Next.js, Clerk authentication, and Neon Postgres.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Auth:** Clerk
- **Database:** Neon Postgres (serverless)
- **ORM:** Drizzle
- **Styling:** Tailwind CSS v4

## Features

- **Build Mode** — Create, edit, and delete flashcards
- **AI Illustrations** — Automatic cartoon-style images generated for each card via OpenAI DALL-E 3
- **Play Mode** — Study cards one at a time with reveal, navigation, and shuffle
- **Secure** — All data is scoped to the authenticated user
- **Mobile-first** — Works on all screen sizes (320px+)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A [Clerk](https://clerk.com/) account (free tier works)
- A [Neon](https://neon.tech/) account (free tier works)
- An [OpenAI](https://platform.openai.com/) account (for AI image generation)
- A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store (for image storage)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd flashcardsai
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

#### Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application (or use an existing one)
3. Go to **API Keys** in the sidebar
4. Copy your **Publishable Key** and **Secret Key**
5. Paste them into `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

#### Neon Setup

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the **Connection String** from the dashboard
4. Paste it into `.env.local`:

```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

#### OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Paste it into `.env.local`:

```
OPENAI_API_KEY=sk-your_key_here
```

> DALL-E 3 costs ~$0.04 per image at 1024x1024 standard quality.

#### Vercel Blob Setup

1. Go to [Vercel Dashboard > Storage](https://vercel.com/dashboard/stores)
2. Create a new Blob store
3. Copy the **Read/Write Token**
4. Paste it into `.env.local`:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
```

> Free tier includes 256MB of storage.

### 3. Push the database schema

Use Drizzle Kit to sync your schema to the database:

```bash
npx drizzle-kit push
```

This creates the `flashcards` table in your Neon database.

> **For production migrations**, use `npx drizzle-kit generate` to create migration files, then `npx drizzle-kit migrate` to apply them.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
flashcardsai/
├── app/
│   ├── (auth)/              # Auth pages (sign-in, sign-up)
│   ├── (protected)/         # Authenticated pages
│   │   ├── dashboard/       # Dashboard with stats
│   │   ├── build/           # Create/edit/delete cards
│   │   └── play/            # Study mode
│   ├── globals.css          # Tailwind + custom styles
│   ├── layout.tsx           # Root layout with ClerkProvider
│   └── page.tsx             # Public landing page
├── components/
│   ├── flashcard-form.tsx   # Create/edit card form
│   ├── flashcard-list.tsx   # Card list with actions
│   ├── flashcard-player.tsx # Study mode player
│   └── header.tsx           # Navigation header
├── lib/
│   ├── actions/
│   │   └── flashcards.ts    # Server actions (CRUD + image gen)
│   ├── ai/
│   │   ├── types.ts         # Provider-agnostic interface
│   │   ├── prompt-builder.ts # Back text → styled prompt
│   │   └── openai-provider.ts # DALL-E 3 implementation
│   ├── storage/
│   │   └── index.ts         # Vercel Blob upload
│   └── db/
│       ├── index.ts         # Database connection
│       └── schema.ts        # Drizzle schema
├── drizzle.config.ts        # Drizzle Kit config
├── middleware.ts             # Clerk auth middleware
└── .env.example             # Environment variable template
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Sync schema to database |
| `npx drizzle-kit studio` | Open Drizzle Studio (DB browser) |
| `npx drizzle-kit generate` | Generate migration files |
| `npx drizzle-kit migrate` | Run pending migrations |

## Security

- All database queries are scoped by the authenticated user's Clerk ID
- Protected routes are enforced via Clerk middleware
- Server actions validate authentication before any data access
- No card data is ever accessible without proper auth

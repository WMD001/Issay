[English](./README.md) | [中文](./README_zh.md)

# Issay

A Chinese microblogging platform ("说说") powered by GitHub Issues as the data store. No traditional database — all data is read and written through the GitHub API.

A lightweight, Memos-style personal timeline: write quick notes, tag them, search, comment, and react.

## Features

- **Post creation, editing, deletion** — Admin can create, edit, and soft-delete posts with Markdown support
- **Drafts** — Save posts as drafts (`draft` label) and publish them later
- **Tags & filtering** — Add custom labels to posts and filter the feed by tag
- **Search** — Full-text search through the GitHub Search API
- **Comments & reactions** — Logged-in users comment and react with their own GitHub identity
- **Infinite scroll** — Home feed with `IntersectionObserver`-based lazy loading
- **Timeline** — Browse posts organized by year, month, and day
- **Dark mode** — System-preference-aware theme switching via `next-themes`
- **Image upload** — Upload images directly to the GitHub repository (max 4 MB)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Frontend | React 19 + Tailwind CSS v4 |
| Auth | NextAuth v4 + GitHub OAuth (JWT strategy) |
| Data | GitHub Issues API (no database) |
| Markdown | react-markdown + remark-gfm + react-syntax-highlighter |
| Theme | next-themes (class-based dark mode) |

## Getting Started

### Prerequisites

- Node.js 20.9+
- A **public** GitHub repository used as the data store, with Issues enabled
- A GitHub OAuth App


### Environment Variables

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `NEXTAUTH_SECRET` | Random secret, e.g. `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Site URL, e.g. `http://localhost:3000` |
| `GITHUB_TOKEN` | **Optional.** PAT (Issues RW, Contents RW, Metadata Read) that raises read rate limits or allows private repositories. Not required for a public repository. |
| `GITHUB_OWNER` | GitHub login of the site owner (admin) |
| `GITHUB_REPO` | Data repository as **`owner/repo`** |

> `GITHUB_REPO` must be the full `owner/repo` name, not just the repository name.
>
> The OAuth callback URL is `/api/auth/callback/github`. Add both the local and production URLs in the OAuth App settings.

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on Vercel

1. Import the repository into Vercel.
2. Add all environment variables above to the Production environment.
3. Set `NEXTAUTH_URL` to the production origin, e.g. `https://your-domain.com`.
4. Add `https://your-domain.com/api/auth/callback/github` to the GitHub OAuth App.
5. Ensure the data repository has Issues enabled and is public when using the `public_repo` OAuth scope.

Notes:

- Vercel limits serverless request bodies to **4.5 MB**, so image uploads are capped at 4 MB in this project.
- Preview deployments use a different origin; add their callback URLs or configure `NEXTAUTH_URL` per environment.
- All writes (posts, edits, deletes, uploads, comments, reactions) use the signed-in user's OAuth token, so no PAT is required for a public repository.
- Anonymous reads are limited to 60 requests/hour per IP; logging in raises the limit with the user's OAuth token. Configure the optional `GITHUB_TOKEN` to keep reads at 5,000 requests/hour for all visitors.

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes (BFF layer, proxies GitHub API)
│   │   ├── auth/               # NextAuth handler
│   │   ├── posts/              # Post CRUD
│   │   ├── comments/           # Comments + emoji reactions
│   │   ├── labels/             # Custom labels for filtering
│   │   └── upload/             # Image upload (GitHub Contents API)
│   ├── post/[id]/              # Post detail page
│   ├── drafts/                 # Draft management (admin)
│   ├── timeline/               # Timeline page
│   ├── page.tsx                # Home (infinite scroll feed)
│   └── layout.tsx / providers.tsx
├── components/
│   ├── Header.tsx              # Site header with auth controls
│   ├── Footer.tsx              # Site footer
│   ├── PostCard.tsx            # Post card for feed display
│   ├── PostCreator.tsx         # Inline post creation form (admin)
│   ├── PostEditor.tsx          # Inline post editing form (admin)
│   ├── SearchBar.tsx           # Feed search input
│   ├── TagFilter.tsx           # Label filter buttons
│   ├── CommentSection.tsx      # Comment list and form
│   ├── ReactionBar.tsx         # Emoji reaction buttons
│   ├── InfiniteScroll.tsx      # IntersectionObserver-based lazy loading
│   ├── Timeline.tsx            # Timeline year/month/day navigation
│   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   └── MarkdownRenderer.tsx    # Markdown rendering with syntax highlighting
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── github.ts               # GitHub API wrapper (sole data access layer)
│   ├── server-auth.ts          # Reads the OAuth access token in route handlers
│   ├── useAdmin.ts             # Client-side admin check hook
│   └── utils.ts                # Utilities + isAdmin()
├── types/
│   ├── index.ts                # Core type definitions
│   └── next-auth.d.ts          # NextAuth type extensions
└── proxy.ts                    # Cache-control headers (Next.js 16 proxy)
```

## Permissions

| Role | Capabilities |
|------|-------------|
| Public | Read posts and comments |
| Logged-in user | Post comments, add reactions |
| Admin | Create/edit/delete posts, manage drafts, upload images |

Admin check: `isAdmin()` in `src/lib/utils.ts` compares the user's GitHub `login` against `GITHUB_OWNER`.

## Data Model

Posts are stored as GitHub Issues:

- **Post**: Issue `number` → `id`, `body` → content, `shuoshuo` label marks posts
- **Draft**: `draft` label on the issue
- **Tags**: Custom labels on the issue
- **Comments**: Issue comments
- **Reactions**: 8 GitHub emoji reactions (+1, -1, laugh, hooray, confused, heart, rocket, eyes)
- **Soft delete**: Closing an issue instead of permanent deletion

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## License

MIT
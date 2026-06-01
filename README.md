[English](./README.md) | [中文](./README_zh.md)

# Issay

A Chinese microblogging platform ("说说") powered by GitHub Issues as the data store. No traditional database — all data is read and written through the GitHub API.

## Features

- **Post Creation** — Admin can create posts with Markdown support (syntax highlighting, tables, etc.)
- **Comments & Reactions** — Logged-in users can comment and add GitHub-style emoji reactions
- **Infinite Scroll** — Home feed with `IntersectionObserver`-based lazy loading
- **Timeline** — Browse posts organized by year, month, and day
- **Dark Mode** — System-preference-aware theme switching via `next-themes`
- **Image Upload** — Upload images directly to GitHub repository via Contents API

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

- Node.js 18+
- A GitHub repository to use as the data store
- A GitHub OAuth App for authentication

### Environment Variables

Create a `.env.local` file with the following variables:

```env
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes (BFF layer, proxies GitHub API)
│   │   ├── auth/               # NextAuth handlers + session endpoint
│   │   ├── posts/              # Post CRUD
│   │   ├── comments/           # Comments + emoji reactions
│   │   └── upload/             # Image upload (GitHub Contents API)
│   ├── post/[id]/              # Post detail page
│   ├── timeline/               # Timeline page
│   ├── page.tsx                # Home (infinite scroll feed)
│   └── layout.tsx / providers.tsx
├── components/
│   ├── Header.tsx              # Site header with auth controls
│   ├── Footer.tsx              # Site footer
│   ├── PostCard.tsx            # Post card for feed display
│   ├── PostCreator.tsx         # Inline post creation form (admin)
│   ├── CommentSection.tsx      # Comment list and form
│   ├── ReactionBar.tsx         # Emoji reaction buttons
│   ├── InfiniteScroll.tsx      # IntersectionObserver-based lazy loading
│   ├── Timeline.tsx            # Timeline year/month/day navigation
│   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   └── MarkdownRenderer.tsx    # Markdown rendering with syntax highlighting
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── github.ts               # GitHub API wrapper (sole data access layer)
│   ├── useAdmin.ts             # Client-side admin check hook
│   └── utils.ts                # Utilities + isAdmin()
├── types/
│   ├── index.ts                # Core type definitions
│   └── next-auth.d.ts          # NextAuth type extensions
└── middleware.ts                # Cache-control headers
```

## Permissions

| Role | Capabilities |
|------|-------------|
| Public | Read posts and comments |
| Logged-in user | Post comments, add reactions |
| Admin | Create/edit/delete posts, upload images |

Admin check: `isAdmin()` in `src/lib/utils.ts` compares the user's GitHub `login` against `GITHUB_OWNER`.

## Data Model

Posts are stored as GitHub Issues:
- **Post**: Issue `number` → `id`, `body` → content, `shuoshuo` label marks posts
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

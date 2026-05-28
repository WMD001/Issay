# Issay 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 GitHub Issues 的个人说说平台，部署到 Vercel

**Architecture:** Next.js 14+ App Router + React + TailwindCSS，通过 API Routes 代理 GitHub Issues API，使用 NextAuth 处理 GitHub OAuth 认证

**Tech Stack:** Next.js, React, TailwindCSS, NextAuth, react-markdown, next-themes, react-syntax-highlighter

**Spec:** `docs/superpowers/specs/2026-05-27-issay-design.md`

---

## 文件结构

```
issay/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── timeline/page.tsx
│   │   ├── post/[id]/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── edit/[id]/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── posts/route.ts
│   │       ├── posts/[id]/route.ts
│   │       ├── comments/route.ts
│   │       └── upload/route.ts
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostDetail.tsx
│   │   ├── Timeline.tsx
│   │   ├── CommentSection.tsx
│   │   ├── ReactionBar.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── SearchBar.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── InfiniteScroll.tsx
│   │   └── AdminGuard.tsx
│   ├── lib/
│   │   ├── github.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── .env.local.example
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## 任务列表

| # | 任务 | 文件 |
|---|------|------|
| 1 | 项目脚手架 + 依赖安装 | `01-scaffolding.md` |
| 2 | 类型定义 + 工具函数 | `02-types-and-utils.md` |
| 3 | GitHub API 封装层 | `03-github-api.md` |
| 4 | NextAuth 认证 | `04-auth.md` |
| 5 | 主题 + 布局 + 根页面 | `05-theme-layout.md` |
| 6 | API Routes - 说说 CRUD | `06-api-posts.md` |
| 7 | API Routes - 评论 + 图片上传 | `07-api-comments-upload.md` |
| 8 | 核心组件（PostCard, MarkdownRenderer, ThemeToggle） | `08-core-components.md` |
| 9 | 首页（无限滚动 + 卡片布局） | `09-home-page.md` |
| 10 | 说说详情页（评论 + 表情） | `10-post-detail.md` |
| 11 | 时间线页面 | `11-timeline.md` |
| 12 | 管理后台页面 | `12-admin.md` |
| 13 | 搜索 + 标签筛选 | `13-search.md` |
| 14 | 部署配置 | `14-deployment.md` |

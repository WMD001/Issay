# CLAUDE.md — Issay 项目指南

## 项目概述

Issay 是一个基于 GitHub Issues 作为数据存储的中文微型博客平台（"说说"）。没有传统数据库，所有数据通过 GitHub API 读写。

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **前端**: React 19 + Tailwind CSS v4
- **认证**: NextAuth v4 + GitHub OAuth (JWT 策略)
- **数据层**: GitHub Issues API（无数据库）
- **Markdown**: react-markdown + remark-gfm + react-syntax-highlighter
- **主题**: next-themes（class-based 暗色模式）

## 重要：这不是你熟悉的 Next.js

Next.js 16 有破坏性变更，API、约定和文件结构可能与你的训练数据不同。在写代码前，请先阅读 `node_modules/next/dist/docs/` 中的相关文档。

## 目录结构

```
src/
├── app/
│   ├── api/                    # API 路由（BFF 层，代理 GitHub API）
│   │   ├── auth/               # NextAuth 处理 + session 接口
│   │   ├── posts/              # 文章 CRUD
│   │   ├── comments/           # 评论 + 表情回应
│   │   └── upload/             # 图片上传（GitHub Contents API）
│   ├── post/[id]/              # 文章详情页
│   ├── timeline/               # 时间线页
│   ├── page.tsx                # 首页（无限滚动 Feed）
│   └── layout.tsx / providers.tsx
├── components/                 # UI 组件（11 个）
├── lib/
│   ├── auth.ts                 # NextAuth 配置
│   ├── github.ts               # GitHub API 封装（唯一数据访问层）
│   ├── useAdmin.ts             # 客户端管理员检查 hook
│   └── utils.ts                # 工具函数 + isAdmin()
└── types/
    ├── index.ts                # 核心类型定义
    └── next-auth.d.ts          # NextAuth 类型扩展
```

## 数据模型

以 GitHub Issue 为数据源：
- **Post**: Issue 的 `number` → `id`，`body` → 内容，`labels` 中 `shuoshuo` 标识帖子，`draft` 标识草稿
- **Comment**: Issue 的评论
- **Reactions**: 8 种 GitHub 表情回应（+1, -1, laugh, hooray, confused, heart, rocket, eyes）
- **软删除**: 删除帖子时关闭 Issue，而非永久删除

## 权限体系

- **公开**: 阅读帖子和评论
- **已登录用户**: 发布评论、添加表情回应
- **仅管理员**: 创建/编辑/删除帖子、上传图片、查看草稿

管理员判断：`src/lib/utils.ts` 中的 `isAdmin()` 比较用户 `login` 与 `GITHUB_OWNER` 环境变量。

## API 路由

所有路由位于 `src/app/api/`，作为服务端代理保护 `GITHUB_TOKEN`：

| 路由 | 方法 | 权限 | 说明 |
|---|---|---|---|
| `/api/posts` | GET | 公开 | 列表（分页，支持 keyword/label/includeDraft 过滤） |
| `/api/posts` | POST | 管理员 | 创建帖子 |
| `/api/posts/[id]` | GET/PATCH/DELETE | GET 公开，其余管理员 | 单篇 CRUD |
| `/api/comments` | GET/POST/PUT | GET 公开，POST/PUT 已登录 | 评论列表/创建/表情回应 |
| `/api/upload` | POST | 管理员 | 图片上传（≤10MB） |

## 环境变量

`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`

## 代码约定

- 路径别名 `@/*` 映射到 `src/*`
- 几乎所有页面都是 `'use client'` 组件，客户端通过 `fetch()` 调用 API 路由
- 首页使用 `IntersectionObserver` 实现无限滚动
- Tailwind v4 + `cn()` 工具（clsx + tailwind-merge）处理条件样式
- 所有 GitHub API 交互隔离在 `src/lib/github.ts`
- 类型定义集中在 `src/types/index.ts`
- UI 文本为中文

## npm 脚本

`dev` / `build` / `start` / `lint` — 无测试框架。

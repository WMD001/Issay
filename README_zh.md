[English](./README.md) | [中文](./README_zh.md)

# Issay

一个基于 GitHub Issues 作为数据存储的中文微型博客平台（"说说"）。没有传统数据库，所有数据通过 GitHub API 读写。

一个轻量的 Memos 风格个人时间线：快速记录、打标签、搜索、评论与表情回应。

## 功能特性

- **发布、编辑、删除** — 管理员可创建、编辑支持 Markdown 的说说，并以关闭 Issue 的方式软删除
- **草稿** — 使用 `draft` 标签保存草稿，稍后发布
- **标签与筛选** — 发帖时添加自定义标签，按标签筛选 Feed
- **搜索** — 通过 GitHub Search API 全文搜索说说
- **评论与表情回应** — 登录用户以本人 GitHub 身份评论和回应
- **无限滚动** — 首页 Feed 基于 `IntersectionObserver` 实现懒加载
- **时间线** — 按年、月、日浏览帖子
- **暗色模式** — 通过 `next-themes` 实现跟随系统偏好的主题切换
- **图片上传** — 通过 GitHub Contents API 直接上传图片到仓库（最大 4MB）

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + TypeScript |
| 前端 | React 19 + Tailwind CSS v4 |
| 认证 | NextAuth v4 + GitHub OAuth（JWT 策略）|
| 数据层 | GitHub Issues API（无数据库）|
| Markdown | react-markdown + remark-gfm + react-syntax-highlighter |
| 主题 | next-themes（class-based 暗色模式）|

## 快速开始

### 前置要求

- Node.js 20.9+
- 一个用作数据存储的**公开** GitHub 仓库，并已开启 Issues
- 一个用于认证的 GitHub OAuth 应用


### 环境变量

| 变量 | 说明 |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App 客户端 ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App 客户端密钥 |
| `NEXTAUTH_SECRET` | 随机密钥，可用 `openssl rand -base64 32` 生成 |
| `NEXTAUTH_URL` | 站点地址，如 `http://localhost:3000` |
| `GITHUB_TOKEN` | **可选。** PAT（Issues 读写、Contents 读写、Metadata 读取），用于提高读取限额或访问私有仓库；公开仓库不需要。 |
| `GITHUB_OWNER` | 站长的 GitHub 用户名（管理员） |
| `GITHUB_REPO` | 数据仓库，格式为 **`owner/repo`** |

> `GITHUB_REPO` 必须填写 `owner/repo` 全名，只写仓库名会导致 404。
>
> OAuth 回调地址为 `/api/auth/callback/github`，本地与线上地址都需要在 OAuth App 中添加。

### 安装与运行

```bash
npm install
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 部署到 Vercel

1. 将仓库导入 Vercel。
2. 在 Production 环境配置上面所有环境变量。
3. 将 `NEXTAUTH_URL` 设置为生产域名，如 `https://your-domain.com`。
4. 在 GitHub OAuth App 中添加 `https://your-domain.com/api/auth/callback/github`。
5. 确认数据仓库已开启 Issues，且在使用 `public_repo` scope 时仓库为公开。

注意事项：

- Vercel Serverless 请求体上限为 **4.5MB**，因此本项目图片上传限制为 4MB。
- Preview 部署使用不同的域名，需要单独添加回调地址或为每个环境配置 `NEXTAUTH_URL`。
- 所有写操作（发帖、编辑、删除、上传、评论、反应）均使用登录用户的 OAuth token，公开仓库无需 PAT。
- 未登录读取受限于 60 次/小时/IP；登录后使用用户 OAuth token 提高限额。如需所有访客都保持 5,000 次/小时，可配置可选的 `GITHUB_TOKEN`。

## 项目结构

```
src/
├── app/
│   ├── api/                    # API 路由（BFF 层，代理 GitHub API）
│   │   ├── auth/               # NextAuth 处理
│   │   ├── posts/              # 帖子 CRUD
│   │   ├── comments/           # 评论 + 表情回应
│   │   ├── labels/             # 用于筛选的自定义标签
│   │   └── upload/             # 图片上传（GitHub Contents API）
│   ├── post/[id]/              # 帖子详情页
│   ├── drafts/                 # 草稿管理（管理员）
│   ├── timeline/               # 时间线页
│   ├── page.tsx                # 首页（无限滚动 Feed）
│   └── layout.tsx / providers.tsx
├── components/
│   ├── Header.tsx              # 网站头部（含登录控件）
│   ├── Footer.tsx              # 网站底部
│   ├── PostCard.tsx            # 帖子卡片（Feed 展示）
│   ├── PostCreator.tsx         # 内联发帖表单（管理员）
│   ├── PostEditor.tsx          # 内联编辑表单（管理员）
│   ├── SearchBar.tsx           # Feed 搜索框
│   ├── TagFilter.tsx           # 标签筛选按钮
│   ├── CommentSection.tsx      # 评论列表与表单
│   ├── ReactionBar.tsx         # 表情回应按钮
│   ├── InfiniteScroll.tsx      # 基于 IntersectionObserver 的懒加载
│   ├── Timeline.tsx            # 时间线年/月/日导航
│   ├── ThemeToggle.tsx         # 暗色/亮色模式切换
│   └── MarkdownRenderer.tsx    # Markdown 渲染（含代码高亮）
├── lib/
│   ├── auth.ts                 # NextAuth 配置
│   ├── github.ts               # GitHub API 封装（唯一数据访问层）
│   ├── server-auth.ts          # 在 Route Handler 中读取 OAuth token
│   ├── useAdmin.ts             # 客户端管理员检查 hook
│   └── utils.ts                # 工具函数 + isAdmin()
├── types/
│   ├── index.ts                # 核心类型定义
│   └── next-auth.d.ts          # NextAuth 类型扩展
└── proxy.ts                    # 缓存控制头（Next.js 16 proxy）
```

## 权限体系

| 角色 | 权限 |
|------|------|
| 公开 | 阅读帖子和评论 |
| 已登录用户 | 发表评论、添加表情回应 |
| 管理员 | 创建/编辑/删除帖子、管理草稿、上传图片 |

管理员判断：`src/lib/utils.ts` 中的 `isAdmin()` 将用户的 GitHub `login` 与 `GITHUB_OWNER` 环境变量进行比较。

## 数据模型

帖子以 GitHub Issue 形式存储：

- **帖子**：Issue `number` → `id`，`body` → 内容，`shuoshuo` 标签标识帖子
- **草稿**：Issue 上的 `draft` 标签
- **标签**：Issue 上的自定义标签
- **评论**：Issue 的评论
- **表情回应**：8 种 GitHub 表情（+1, -1, laugh, hooray, confused, heart, rocket, eyes）
- **软删除**：关闭 Issue 而非永久删除

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产环境构建 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint |

## 开源协议

MIT
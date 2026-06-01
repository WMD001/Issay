[English](./README.md) | [中文](./README_zh.md)

# Issay

一个基于 GitHub Issues 作为数据存储的中文微型博客平台（"说说"）。没有传统数据库，所有数据通过 GitHub API 读写。

## 功能特性

- **发布说说** — 管理员可创建支持 Markdown 的帖子（代码高亮、表格等）
- **评论与表情回应** — 登录用户可发表评论和添加 GitHub 风格的表情回应
- **无限滚动** — 首页 Feed 基于 `IntersectionObserver` 实现懒加载
- **时间线** — 按年、月、日浏览帖子
- **暗色模式** — 通过 `next-themes` 实现跟随系统偏好的主题切换
- **图片上传** — 通过 GitHub Contents API 直接上传图片到仓库

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

- Node.js 18+
- 一个用作数据存储的 GitHub 仓库
- 一个用于认证的 GitHub OAuth 应用

### 环境变量

创建 `.env.local` 文件，填入以下变量：

```env
GITHUB_CLIENT_ID=你的_GitHub_OAuth_客户端ID
GITHUB_CLIENT_SECRET=你的_GitHub_OAuth_客户端密钥
NEXTAUTH_SECRET=你的随机密钥字符串
NEXTAUTH_URL=http://localhost:3000
GITHUB_TOKEN=你的_GitHub_个人访问令牌
GITHUB_OWNER=你的_GitHub_用户名
GITHUB_REPO=你的仓库名
```

### 安装与运行

```bash
npm install
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 项目结构

```
src/
├── app/
│   ├── api/                    # API 路由（BFF 层，代理 GitHub API）
│   │   ├── auth/               # NextAuth 处理 + session 接口
│   │   ├── posts/              # 帖子 CRUD
│   │   ├── comments/           # 评论 + 表情回应
│   │   └── upload/             # 图片上传（GitHub Contents API）
│   ├── post/[id]/              # 帖子详情页
│   ├── timeline/               # 时间线页
│   ├── page.tsx                # 首页（无限滚动 Feed）
│   └── layout.tsx / providers.tsx
├── components/
│   ├── Header.tsx              # 网站头部（含登录控件）
│   ├── Footer.tsx              # 网站底部
│   ├── PostCard.tsx            # 帖子卡片（Feed 展示）
│   ├── PostCreator.tsx         # 内联发帖表单（管理员）
│   ├── CommentSection.tsx      # 评论列表与表单
│   ├── ReactionBar.tsx         # 表情回应按钮
│   ├── InfiniteScroll.tsx      # 基于 IntersectionObserver 的懒加载
│   ├── Timeline.tsx            # 时间线年/月/日导航
│   ├── ThemeToggle.tsx         # 暗色/亮色模式切换
│   └── MarkdownRenderer.tsx    # Markdown 渲染（含代码高亮）
├── lib/
│   ├── auth.ts                 # NextAuth 配置
│   ├── github.ts               # GitHub API 封装（唯一数据访问层）
│   ├── useAdmin.ts             # 客户端管理员检查 hook
│   └── utils.ts                # 工具函数 + isAdmin()
├── types/
│   ├── index.ts                # 核心类型定义
│   └── next-auth.d.ts          # NextAuth 类型扩展
└── middleware.ts                # 缓存控制头
```

## 权限体系

| 角色 | 权限 |
|------|------|
| 公开 | 阅读帖子和评论 |
| 已登录用户 | 发表评论、添加表情回应 |
| 管理员 | 创建/编辑/删除帖子、上传图片 |

管理员判断：`src/lib/utils.ts` 中的 `isAdmin()` 将用户的 GitHub `login` 与 `GITHUB_OWNER` 环境变量进行比较。

## 数据模型

帖子以 GitHub Issue 形式存储：
- **帖子**：Issue `number` → `id`，`body` → 内容，`shuoshuo` 标签标识帖子
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

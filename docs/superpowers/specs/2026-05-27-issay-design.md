# Issay - GitHub Issues 说说平台设计文档

> 日期：2026-05-27
> 技术栈：Next.js 14+ App Router + React + TailwindCSS + GitHub Issues API

## 1. 项目定位

个人微型博客，基于 GitHub Issues 作为数据存储。作者通过网站管理后台发布说说，访客只能浏览。

- 单作者发布，访客只读
- 支持 GitHub 登录后评论
- 部署到 Vercel

## 2. 核心功能

### 2.1 说说发布

- 管理后台发布，需 GitHub OAuth 登录
- 内容支持 Markdown + 图片（上传到 GitHub Issue 附件）
- 草稿通过 `draft` 标签区分，发布时移除 `draft` 标签
- 说说固定使用 `shuoshuo` 标签

### 2.2 说说浏览

- 首页：卡片式布局，无限滚动加载
- 时间线页面（`/timeline`）：按年月日树形导航，独立纵览
- 说说详情页（`/post/[id]`）：完整 Markdown 渲染 + 评论 + 表情反应
- 搜索：通过 GitHub Search API 进行服务端关键词搜索 + 标签筛选

### 2.3 评论与互动

- 展示 GitHub Issues 的评论列表
- 登录 GitHub 的访客可以发表评论
- 展示 GitHub Issues 的 emoji 表情反应，支持点击添加

### 2.4 主题

- 明暗主题切换
- 使用 `next-themes`，偏好存储在 `localStorage`
- 首次访问跟随系统设置

## 3. 技术架构

### 3.1 项目结构

```
issay/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局（主题Provider、字体）
│   │   ├── page.tsx                # 首页（说说卡片流）
│   │   ├── timeline/page.tsx       # 时间线页面
│   │   ├── post/[id]/page.tsx      # 说说详情
│   │   ├── admin/
│   │   │   ├── page.tsx            # 管理后台（说说列表）
│   │   │   ├── new/page.tsx        # 新建说说
│   │   │   └── edit/[id]/page.tsx  # 编辑说说
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # GitHub OAuth
│   │       ├── posts/route.ts       # 说说列表 / 创建
│   │       ├── posts/[id]/route.ts  # 单条说说 读/改/删
│   │       ├── comments/route.ts    # 评论
│   │       └── upload/route.ts      # 图片上传
│   ├── components/
│   │   ├── PostCard.tsx            # 说说卡片
│   │   ├── Timeline.tsx            # 年月日时间线导航
│   │   ├── CommentSection.tsx      # 评论区 + 表情反应
│   │   ├── ThemeToggle.tsx         # 明暗切换
│   │   ├── SearchBar.tsx           # 搜索 + 标签筛选
│   │   ├── MarkdownRenderer.tsx    # Markdown 渲染
│   │   └── InfiniteScroll.tsx      # 无限滚动
│   ├── lib/
│   │   ├── github.ts               # GitHub API 封装
│   │   ├── auth.ts                 # NextAuth 配置
│   │   └── utils.ts                # 工具函数
│   └── types/
│       └── index.ts                # TypeScript 类型
├── public/
├── .env.local                      # 环境变量
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### 3.2 数据流

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   前端页面    │────→│  API Routes  │────→│ GitHub API  │
│  (React)     │←────│  (Next.js)   │←────│ (Issues)    │
└─────────────┘     └──────────────┘     └─────────────┘
```

- 浏览说说：前端 → `/api/posts` → GitHub Issues API → 过滤 `draft` → 返回
- 发布说说：管理后台 → `/api/posts` → GitHub Issues API 创建 Issue
- 图片上传：管理后台 → `/api/upload` → GitHub Issue 附件 API
- 评论：前端 → `/api/comments` → GitHub Issues Comments API
- 表情：前端 → GitHub Issues Reactions API

### 3.3 认证流程

```
用户点击"登录" → GitHub OAuth 授权页
    → 用户授权 → 回调 /api/auth/callback/github
    → NextAuth 签发 JWT Session
    → 前端通过 Session 判断身份
```

- 管理员权限：通过 `GITHUB_OWNER` 环境变量匹配用户名
- 访客评论：任何 GitHub 用户登录后即可

### 3.4 数据模型（GitHub Issue 映射）

| Issue 字段 | 说说字段 |
|-----------|---------|
| `title` | 说说标题（可选，为空时取 body 前 30 字作为摘要） |
| `body` | 说说正文（Markdown） |
| `labels` | `["shuoshuo"]` 或 `["shuoshuo", "draft"]` |
| `comments` | 评论列表 |
| `reactions` | 表情反应 |
| `created_at` | 发布时间 |
| `updated_at` | 编辑时间 |
| `number` | 说说 ID（用于路由 `/post/[id]`） |

## 4. 页面设计

### 4.1 首页（`/`）

- 卡片式布局，无限滚动
- 每张卡片：头像 + 作者名 + 发布时间 + Markdown 预览 + 标签 + 评论数 + 表情摘要
- 顶部：Logo + 搜索框 + 主题切换 + 登录按钮
- 点击卡片跳转详情页

### 4.2 时间线（`/timeline`）

- 左侧：年月日树形导航，年份默认展开，月/日可折叠
- 右侧：对应时间段的说说精简列表（时间 + 内容摘要）
- 顶部：返回首页 + 搜索框

### 4.3 说说详情（`/post/[id]`）

- 完整 Markdown 渲染（代码高亮、图片 lightbox）
- 评论区：评论列表 + 表情反应栏
- 未登录：显示"登录后评论"按钮
- 已登录：评论输入框 + 表情选择

### 4.4 管理后台（`/admin`）

- 说说列表：标题/摘要 + 状态（已发布/草稿） + 时间 + 操作按钮
- 搜索 + 标签筛选
- 新建/编辑：Markdown 编辑器 + 图片上传 + 标签管理

### 4.5 新建/编辑说说

- 标题输入（可选）
- Markdown 编辑器（支持实时预览）
- 图片上传按钮（拖拽 / 点击选择）
- 标签选择：已发布（`shuoshuo`）/ 草稿（`shuoshuo` + `draft`）
- 保存 / 发布按钮

## 5. 样式方案

### 5.1 色彩

| 元素 | 亮色模式 | 暗色模式 |
|------|---------|---------|
| 背景 | `#ffffff` / `#f9fafb` | `#111827` / `#1f2937` |
| 卡片 | `#ffffff` | `#1f2937` |
| 主文字 | `#111827` | `#f9fafb` |
| 次要文字 | `#6b7280` | `#9ca3af` |
| 强调色 | `#3b82f6` | `#60a5fa` |
| 边框 | `#e5e7eb` | `#374151` |

### 5.2 响应式

- 移动端（< 768px）：单列卡片，时间线隐藏/底部抽屉
- 平板（768px - 1024px）：单列 + 侧边时间线可收起
- 桌面（> 1024px）：卡片流 + 右侧固定时间线

### 5.3 Markdown 渲染

- `react-markdown` + `remark-gfm`
- 代码高亮：`react-syntax-highlighter`（Prism 主题适配明暗模式）
- 图片：懒加载 + 点击放大（lightbox）

## 6. 环境变量

| 变量 | 说明 |
|------|------|
| `GITHUB_TOKEN` | GitHub Personal Access Token（`repo` 权限） |
| `GITHUB_OWNER` | GitHub 用户名（判断管理员身份） |
| `GITHUB_REPO` | 存放说说的仓库名（如 `owner/repo`） |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |

## 7. GitHub OAuth App 配置

- 创建位置：GitHub Settings → Developer settings → OAuth Apps
- Homepage URL：`https://your-domain.vercel.app`
- Callback URL：`https://your-domain.vercel.app/api/auth/callback/github`

## 8. 部署

- 通过 GitHub 仓库关联 Vercel，push 自动部署
- 环境变量在 Vercel Dashboard 配置
- Next.js API Routes 作为 Serverless Functions 运行

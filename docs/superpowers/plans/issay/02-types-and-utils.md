# Task 2: 类型定义 + 工具函数

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/utils.ts`

## Steps

- [ ] **Step 1: 创建 TypeScript 类型定义**

```typescript
// src/types/index.ts

/** GitHub Issue 转换后的说说数据结构 */
export interface Post {
  id: number;           // Issue number，用作路由 /post/[id]
  title: string;
  body: string;
  summary: string;      // body 前 30 字（title 为空时使用）
  labels: string[];
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  commentCount: number;
  reactions: Reactions;
}

/** GitHub Issue Reactions */
export interface Reactions {
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

/** GitHub Issue Comment */
export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  reactions: Reactions;
}

/** 时间线节点 */
export interface TimelineEntry {
  year: number;
  month: number;
  day: number;
  posts: Post[];
}

/** 时间线按年月分组 */
export interface TimelineGroup {
  year: number;
  months: {
    month: number;
    days: {
      day: number;
      count: number;
    }[];
  }[];
}

/** API 分页响应 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

/** 搜索参数 */
export interface SearchParams {
  keyword?: string;
  label?: string;
  page?: number;
}

/** NextAuth Session 扩展 */
export interface ExtendedSession {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    login?: string;
  };
  accessToken?: string;
}
```

- [ ] **Step 2: 创建工具函数**

```typescript
// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** TailwindCSS 类名合并工具 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 从 body 提取摘要（前 30 字） */
export function extractSummary(body: string): string {
  const text = body
    .replace(/#{1,6}\s/g, '')       // 移除标题标记
    .replace(/\*\*/g, '')           // 移除加粗
    .replace(/`{1,3}[^`]*`{1,3}/g, '[code]') // 代码块替换
    .replace(/!\[.*?\]\(.*?\)/g, '[图片]')    // 图片替换
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')    // 链接保留文字
    .replace(/\n+/g, ' ')           // 换行替换为空格
    .trim();

  if (text.length <= 30) return text;
  return text.slice(0, 30) + '...';
}

/** 格式化时间为相对时间 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 30) return `${diffDay} 天前`;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 格式化为完整日期 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/** 检查标签列表中是否包含指定标签 */
export function hasLabel(labels: string[], label: string): boolean {
  return labels.some(l => l.toLowerCase() === label.toLowerCase());
}

/** 从 labels 数组提取不含 shuoshuo/draft 的自定义标签 */
export function extractCustomLabels(labels: string[]): string[] {
  const systemLabels = new Set(['shuoshuo', 'draft']);
  return labels.filter(l => !systemLabels.has(l.toLowerCase()));
}
```

- [ ] **Step 3: 安装 clsx + tailwind-merge**

```bash
cd D:/workspace_owner/Issay
npm install clsx tailwind-merge
```

- [ ] **Step 4: 验证类型编译通过**

```bash
cd D:/workspace_owner/Issay
npx tsc --noEmit
```

Expected: 无错误输出

- [ ] **Step 5: 提交**

```bash
cd D:/workspace_owner/Issay
git add src/types/index.ts src/lib/utils.ts
git commit -m "feat: add type definitions and utility functions"
```

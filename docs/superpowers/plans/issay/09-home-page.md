# Task 9: 首页（无限滚动 + 卡片布局）

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

## Steps

- [ ] **Step 1: 创建首页客户端组件**

```tsx
// src/app/page.tsx
'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Post, PaginatedResponse } from '@/types';
import PostCard from '@/components/PostCard';
import InfiniteScroll from '@/components/InfiniteScroll';
import SearchBar from '@/components/SearchBar';

function HomeContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const label = searchParams.get('label') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [initialized, setInitialized] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum: number): Promise<PaginatedResponse<Post>> => {
      const params = new URLSearchParams({ page: String(pageNum) });
      if (keyword) params.set('keyword', keyword);
      if (label) params.set('label', label);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    [keyword, label]
  );

  // 初始化加载
  const init = useCallback(async () => {
    if (initialized) return;
    const result = await fetchPosts(1);
    setPosts(result.data);
    setPage(2);
    setInitialized(true);
  }, [initialized, fetchPosts]);

  // 首次渲染时触发
  if (!initialized) {
    init();
  }

  const loadMore = useCallback(async (): Promise<boolean> => {
    const result = await fetchPosts(page);
    setPosts(prev => [...prev, ...result.data]);
    setPage(prev => prev + 1);
    return result.hasMore;
  }, [page, fetchPosts]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 搜索栏 */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* 说说列表 */}
      {!initialized ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          加载中...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          {keyword ? '没有找到匹配的说说' : '还没有说说'}
        </div>
      ) : (
        <InfiniteScroll onLoadMore={loadMore}>
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        加载中...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: 添加全局样式（如 line-clamp）**

在 `src/app/globals.css` 的 `@tailwind` 指令后添加：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Markdown 样式覆盖 */
.prose img {
  border-radius: 0.5rem;
}

.prose pre {
  border-radius: 0.5rem;
}

.prose code {
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
}
```

- [ ] **Step 3: 启动开发服务器验证**

```bash
cd D:/workspace_owner/Issay
npm run dev
```

Expected: 首页显示说说卡片列表，滚动到底部自动加载更多

- [ ] **Step 4: 提交**

```bash
cd D:/workspace_owner/Issay
git add src/app/page.tsx src/app/globals.css
git commit -m "feat: add home page with infinite scroll and card layout"
```

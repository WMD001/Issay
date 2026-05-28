# Task 8: 核心组件

**Files:**
- Create: `src/components/MarkdownRenderer.tsx`
- Create: `src/components/PostCard.tsx`
- Create: `src/components/SearchBar.tsx`
- Create: `src/components/InfiniteScroll.tsx`

## Steps

- [ ] **Step 1: 创建 MarkdownRenderer 组件**

```tsx
// src/components/MarkdownRenderer.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useTheme } from 'next-themes';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const { theme } = useTheme();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <>
      <div className={`prose dark:prose-invert max-w-none ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              if (!inline && match) {
                return (
                  <SyntaxHighlighter
                    style={theme === 'dark' ? oneDark : oneLight}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            img({ src, alt, ...props }) {
              return (
                <img
                  src={src}
                  alt={alt}
                  loading="lazy"
                  className="cursor-pointer hover:opacity-80 transition-opacity rounded-lg"
                  onClick={() => src && setLightboxSrc(src)}
                  {...props}
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: 创建 PostCard 组件**

```tsx
// src/components/PostCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatRelativeTime, extractCustomLabels } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const customLabels = extractCustomLabels(post.labels);

  return (
    <Link href={`/post/${post.id}`}>
      <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all cursor-pointer">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-3">
          <Image
            src={post.author.avatarUrl}
            alt={post.author.login}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {post.author.login}
            </span>
            <time className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatRelativeTime(post.createdAt)}
            </time>
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {post.title}
          </h3>
        )}

        {/* Content preview */}
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-3">
          {post.summary}
        </div>

        {/* Tags */}
        {customLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {customLabels.map(label => (
              <span
                key={label}
                className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Footer: comments + reactions */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {post.commentCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.commentCount}
            </span>
          )}
          {post.reactions.total_count > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.reactions.total_count}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
```

- [ ] **Step 3: 创建 SearchBar 组件**

```tsx
// src/components/SearchBar.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  labels?: string[];
}

export default function SearchBar({ labels = [] }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedLabel, setSelectedLabel] = useState(searchParams.get('label') || '');

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (selectedLabel) params.set('label', selectedLabel);
    router.push(`/?${params.toString()}`);
  }, [keyword, selectedLabel, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setKeyword('');
    setSelectedLabel('');
    router.push('/');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索说说..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {labels.length > 0 && (
        <select
          value={selectedLabel}
          onChange={(e) => setSelectedLabel(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">全部标签</option>
          {labels.map(label => (
            <option key={label} value={label}>{label}</option>
          ))}
        </select>
      )}

      <button
        onClick={handleSearch}
        className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        搜索
      </button>

      {(keyword || selectedLabel) && (
        <button
          onClick={handleClear}
          className="px-3 py-2 text-sm rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          清除
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 创建 InfiniteScroll 组件**

```tsx
// src/components/InfiniteScroll.tsx
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => Promise<boolean>;  // 返回 false 表示没有更多
  children: React.ReactNode;
}

export default function InfiniteScroll({ onLoadMore, children }: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleIntersect = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading && hasMore) {
        setLoading(true);
        try {
          const more = await onLoadMore();
          setHasMore(more);
        } catch {
          setHasMore(false);
        }
        setLoading(false);
      }
    },
    [loading, hasMore, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div>
      {children}
      <div ref={sentinelRef} className="h-4" />
      {loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          加载中...
        </div>
      )}
      {!hasMore && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          没有更多了
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: 验证类型编译通过**

```bash
cd D:/workspace_owner/Issay
npx tsc --noEmit
```

- [ ] **Step 6: 提交**

```bash
cd D:/workspace_owner/Issay
git add src/components/
git commit -m "feat: add core UI components (PostCard, MarkdownRenderer, SearchBar, InfiniteScroll)"
```

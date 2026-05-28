# Task 11: 时间线页面

**Files:**
- Create: `src/components/Timeline.tsx`
- Create: `src/app/timeline/page.tsx`

## Steps

- [ ] **Step 1: 创建 Timeline 组件**

```tsx
// src/components/Timeline.tsx
'use client';

import { Post, TimelineGroup } from '@/types';
import { formatRelativeTime, extractSummary } from '@/lib/utils';

interface TimelineProps {
  posts: Post[];
  groups: TimelineGroup;
  selectedDate: { year: number; month: number; day: number } | null;
  onSelectDate: (year: number, month: number, day: number) => void;
}

export default function Timeline({ posts, groups, selectedDate, onSelectDate }: TimelineProps) {
  return (
    <div className="flex gap-8">
      {/* 左侧：年月日树形导航 */}
      <aside className="w-48 flex-shrink-0 hidden lg:block">
        <div className="sticky top-20 space-y-1">
          {groups.year > 0 && (
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {groups.year}
            </div>
          )}

          {groups.months.map(monthGroup => (
            <div key={monthGroup.month} className="mb-3">
              <button
                onClick={() => onSelectDate(groups.year, monthGroup.month, 0)}
                className={`w-full text-left text-sm px-2 py-1 rounded ${
                  selectedDate?.year === groups.year && selectedDate?.month === monthGroup.month && selectedDate?.day === 0
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {monthGroup.month} 月
              </button>

              <div className="ml-3 mt-1 space-y-0.5">
                {monthGroup.days.map(dayGroup => (
                  <button
                    key={dayGroup.day}
                    onClick={() => onSelectDate(groups.year, monthGroup.month, dayGroup.day)}
                    className={`w-full text-left text-xs px-2 py-0.5 rounded flex items-center justify-between ${
                      selectedDate?.year === groups.year && selectedDate?.month === monthGroup.month && selectedDate?.day === dayGroup.day
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <span>{dayGroup.day} 日</span>
                    <span className="text-gray-400 dark:text-gray-600">{dayGroup.count}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 右侧：说说精简列表 */}
      <div className="flex-1">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            该时间段暂无说说
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <a
                key={post.id}
                href={`/post/${post.id}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {post.title && (
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                        {post.title}
                      </h4>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {post.summary}
                    </p>
                  </div>
                  <time className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatRelativeTime(post.createdAt)}
                  </time>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建时间线页面**

```tsx
// src/app/timeline/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Post, TimelineGroup } from '@/types';
import Timeline from '@/components/Timeline';

export default function TimelinePage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);

  // 加载所有说说（分页获取全部）
  useEffect(() => {
    const fetchAll = async () => {
      let page = 1;
      let posts: Post[] = [];
      let hasMore = true;

      while (hasMore) {
        const res = await fetch(`/api/posts?page=${page}&perPage=100`);
        if (!res.ok) break;
        const data = await res.json();
        posts = [...posts, ...data.data];
        hasMore = data.hasMore;
        page++;
      }

      setAllPosts(posts);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // 按年月日分组
  const groups = useMemo(() => {
    const groupMap = new Map<number, Map<number, Map<number, number>>>();

    allPosts.forEach(post => {
      const date = new Date(post.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      if (!groupMap.has(year)) groupMap.set(year, new Map());
      const yearMap = groupMap.get(year)!;
      if (!yearMap.has(month)) yearMap.set(month, new Map());
      const monthMap = yearMap.get(month)!;
      monthMap.set(day, (monthMap.get(day) || 0) + 1);
    });

    // 取最新的年份作为主分组
    const years = Array.from(groupMap.keys()).sort((a, b) => b - a);
    const latestYear = years[0] || 0;
    const yearMap = groupMap.get(latestYear) || new Map();

    const months = Array.from(yearMap.entries())
      .sort(([a], [b]) => b - a)
      .map(([month, dayMap]) => ({
        month,
        days: Array.from(dayMap.entries())
          .sort(([a], [b]) => b - a)
          .map(([day, count]) => ({ day, count })),
      }));

    return { year: latestYear, months } as TimelineGroup;
  }, [allPosts]);

  // 根据选中日期筛选
  const filteredPosts = useMemo(() => {
    if (!selectedDate) return allPosts;

    return allPosts.filter(post => {
      const date = new Date(post.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      if (selectedDate.day > 0) {
        return year === selectedDate.year && month === selectedDate.month && day === selectedDate.day;
      }
      if (selectedDate.month > 0) {
        return year === selectedDate.year && month === selectedDate.month;
      }
      return year === selectedDate.year;
    });
  }, [allPosts, selectedDate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">时间线</h1>
        <div className="w-20" /> {/* 占位，保持标题居中 */}
      </div>

      {/* 时间线内容 */}
      <Timeline
        posts={filteredPosts}
        groups={groups}
        selectedDate={selectedDate}
        onSelectDate={(year, month, day) => {
          setSelectedDate(
            selectedDate?.year === year && selectedDate?.month === month && selectedDate?.day === day
              ? null  // 再次点击取消选择
              : { year, month, day }
          );
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: 验证页面功能**

```bash
cd D:/workspace_owner/Issay
npm run dev
```

Expected: `/timeline` 显示时间线导航 + 说说列表，点击日期可筛选

- [ ] **Step 4: 提交**

```bash
cd D:/workspace_owner/Issay
git add src/components/Timeline.tsx src/app/timeline/
git commit -m "feat: add timeline page with year/month/day navigation"
```

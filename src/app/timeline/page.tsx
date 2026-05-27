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
    const yearMap = groupMap.get(latestYear) || new Map<number, Map<number, number>>();

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

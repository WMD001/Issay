'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
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

  useEffect(() => {
    fetchPosts(1).then(result => {
      setPosts(result.data);
      setPage(2);
      setInitialized(true);
    });
  }, [fetchPosts]);

  const loadMore = useCallback(async (): Promise<boolean> => {
    const result = await fetchPosts(page);
    setPosts(prev => [...prev, ...result.data]);
    setPage(prev => prev + 1);
    return result.hasMore;
  }, [page, fetchPosts]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <SearchBar />
      </div>
      {!initialized ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">加载中...</div>
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
    <Suspense fallback={<div className="text-center py-16 text-gray-500 dark:text-gray-400">加载中...</div>}>
      <HomeContent />
    </Suspense>
  );
}

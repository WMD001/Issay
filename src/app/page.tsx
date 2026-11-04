'use client';

import { useState, useCallback, useEffect } from 'react';
import { Post, PaginatedResponse } from '@/types';
import PostCard from '@/components/PostCard';
import PostCreator from '@/components/PostCreator';
import InfiniteScroll from '@/components/InfiniteScroll';
import SearchBar from '@/components/SearchBar';
import TagFilter from '@/components/TagFilter';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(2);
  const [initialized, setInitialized] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  const fetchPage = useCallback(
    async (pageNum: number): Promise<PaginatedResponse<Post>> => {
      const params = new URLSearchParams({
        page: String(pageNum),
        perPage: '10',
      });
      if (keyword) params.set('keyword', keyword);
      if (label) params.set('label', label);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? '加载失败');
      }
      return res.json() as Promise<PaginatedResponse<Post>>;
    },
    [keyword, label]
  );

  useEffect(() => {
    let active = true;
    const delay = keyword ? 350 : 0;

    const timer = setTimeout(async () => {
      setInitialized(false);
      setError('');
      try {
        const result = await fetchPage(1);
        if (!active) return;
        setPosts(result.data);
        setPage(2);
      } catch (e) {
        if (active) {
          setPosts([]);
          setError(e instanceof Error ? e.message : '加载失败');
        }
      } finally {
        if (active) setInitialized(true);
      }
    }, delay);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fetchPage, keyword]);

  const loadMore = useCallback(async (): Promise<boolean> => {
    const result = await fetchPage(page);
    setPosts(prev => [...prev, ...result.data]);
    setPage(prev => prev + 1);
    return result.hasMore;
  }, [page, fetchPage]);

  const handleCreated = (post?: Post) => {
    if (!post || post.isDraft) return;
    setPosts(prev => [post, ...prev]);
    setInitialized(true);
  };

  const handleUpdated = (updated: Post) => {
    setPosts(prev => {
      if (updated.isDraft) {
        return prev.filter(post => post.id !== updated.id);
      }
      return prev.map(post => (post.id === updated.id ? updated : post));
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PostCreator onCreated={handleCreated} />
      <SearchBar value={keyword} onChange={setKeyword} />
      <TagFilter selected={label} onSelect={setLabel} />

      {!initialized ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">加载中...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-600 dark:text-red-400">加载失败：{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          {keyword || label ? '没有找到相关说说' : '还没有说说'}
        </div>
      ) : (
        <InfiniteScroll onLoadMore={loadMore}>
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onUpdated={handleUpdated}
                onDeleted={id => setPosts(prev => prev.filter(item => item.id !== id))}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
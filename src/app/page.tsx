'use client';

import { useState, useCallback, useEffect } from 'react';
import { Post, PaginatedResponse } from '@/types';
import PostCard from '@/components/PostCard';
import PostCreator from '@/components/PostCreator';
import InfiniteScroll from '@/components/InfiniteScroll';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [initialized, setInitialized] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number): Promise<PaginatedResponse<Post>> => {
    const res = await fetch(`/api/posts?page=${pageNum}&_=${Date.now()}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  }, []);

  const loadPosts = useCallback(() => {
    fetchPosts(1).then(result => {
      setPosts(result.data);
      setPage(2);
      setInitialized(true);
    });
  }, [fetchPosts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const loadMore = useCallback(async (): Promise<boolean> => {
    const result = await fetchPosts(page);
    setPosts(prev => [...prev, ...result.data]);
    setPage(prev => prev + 1);
    return result.hasMore;
  }, [page, fetchPosts]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PostCreator onCreated={(post) => {
        if (post) {
          setPosts(prev => [post, ...prev]);
          setInitialized(true);
        }
        setTimeout(() => loadPosts(), 2000);
      }} />
      {!initialized ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">还没有说说</div>
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

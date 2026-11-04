'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Post, PaginatedResponse } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DraftsPage() {
  const { data: session, status } = useSession();
  const isAdmin = Boolean(session?.user?.isAdmin);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(
      '/api/posts?includeDraft=true&draftOnly=true&perPage=100'
    );
    if (res.ok) {
      const data = (await res.json()) as PaginatedResponse<Post>;
      setPosts(data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [isAdmin, load]);

  const publish = async (id: number) => {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDraft: false }),
    });
    if (res.ok) {
      setPosts(prev => prev.filter(post => post.id !== id));
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('确定删除这篇草稿？')) return;
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts(prev => prev.filter(post => post.id !== id));
    }
  };

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
        加载中...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">需要管理员权限</p>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">草稿</h1>
        <Link
          href="/"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          返回首页
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">暂无草稿</div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div
              key={post.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {post.title && (
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                      {post.title}
                    </h3>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {post.summary}
                  </p>
                  <time className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(post.createdAt)}
                  </time>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/post/${post.id}`}
                    className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    查看
                  </Link>
                  <button
                    onClick={() => publish(post.id)}
                    className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    发布
                  </button>
                  <button
                    onClick={() => remove(post.id)}
                    className="px-2 py-1 text-xs text-red-500 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
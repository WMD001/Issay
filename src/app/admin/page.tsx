'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { formatDate, extractSummary } from '@/lib/utils';
import AdminGuard from '@/components/AdminGuard';

function AdminContent() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?page=1&includeDraft=true');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(data.data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条说说吗？')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          管理后台
        </h1>
        <Link
          href="/admin/new"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
        >
          新建说说
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          还没有说说
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  标题 / 摘要
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-20">
                  状态
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-36">
                  创建时间
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-28 text-right">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {posts.map(post => (
                <tr
                  key={post.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {post.title || extractSummary(post.body)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        post.isDraft
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {post.isDraft ? '草稿' : '已发布'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/admin/edit/${post.id}`)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdminContent />
      </div>
    </AdminGuard>
  );
}

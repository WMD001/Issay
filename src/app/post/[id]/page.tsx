'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate, extractCustomLabels } from '@/lib/utils';
import { useAdmin } from '@/lib/useAdmin';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReactionBar from '@/components/ReactionBar';
import CommentSection from '@/components/CommentSection';
import PostEditor from '@/components/PostEditor';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const isAdmin = useAdmin();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = (await res.json()) as Post;
        if (active) setPost(data);
      } catch {
        if (active) setError('加载失败');
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchPost();
    return () => {
      active = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!post || !window.confirm('确定删除这条说说？')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('删除失败');
      router.push('/');
    } catch {
      window.alert('删除失败，请重试');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
        加载中...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error || '说说不存在'}</p>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">返回首页</Link>
      </div>
    );
  }

  const customLabels = extractCustomLabels(post.labels);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </Link>

      <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {editing ? (
          <PostEditor
            post={post}
            onSaved={(updated) => {
              setPost(updated);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.login}
                  width={44}
                  height={44}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {post.author.login}
                  </div>
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(post.createdAt)}
                  </time>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    编辑
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-2 py-1 text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    {deleting ? '删除中...' : '删除'}
                  </button>
                </div>
              )}
            </div>

            {post.title && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>
            )}

            {customLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {customLabels.map(label => (
                  <span
                    key={label}
                    className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            <MarkdownRenderer content={post.body} />

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <ReactionBar
                targetId={post.id}
                reactions={post.reactions}
                onReact={() => {
                  fetch(`/api/posts/${id}?_=${Date.now()}`)
                    .then(res => res.json())
                    .then((data: Post) => setPost(data));
                }}
              />
            </div>
          </>
        )}
      </article>

      <CommentSection issueId={post.id} />
    </div>
  );
}
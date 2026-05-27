'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate, extractCustomLabels } from '@/lib/utils';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReactionBar from '@/components/ReactionBar';
import CommentSection from '@/components/CommentSection';

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        setPost(await res.json());
      } catch {
        setError('加载失败');
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

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
      {/* 返回按钮 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </Link>

      {/* 说说内容 */}
      <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {/* 作者信息 */}
        <div className="flex items-center gap-3 mb-4">
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

        {/* 标题 */}
        {post.title && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
        )}

        {/* 标签 */}
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

        {/* Markdown 内容 */}
        <MarkdownRenderer content={post.body} />

        {/* 表情反应 */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <ReactionBar
            targetId={post.id}
            reactions={post.reactions}
            onReact={() => {
              fetch(`/api/posts/${id}`)
                .then(r => r.json())
                .then(setPost);
            }}
          />
        </div>
      </article>

      {/* 评论区 */}
      <CommentSection issueId={post.id} />
    </div>
  );
}

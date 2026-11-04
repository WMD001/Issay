'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Post } from '@/types';
import { formatRelativeTime, extractCustomLabels } from '@/lib/utils';
import { useAdmin } from '@/lib/useAdmin';
import MarkdownRenderer from './MarkdownRenderer';
import ReactionBar from './ReactionBar';
import CommentSection from './CommentSection';
import PostEditor from './PostEditor';

interface PostCardProps {
  post: Post;
  onUpdated?: (post: Post) => void;
  onDeleted?: (id: number) => void;
}

export default function PostCard({ post, onUpdated, onDeleted }: PostCardProps) {
  const isAdmin = useAdmin();
  const [editing, setEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reactions, setReactions] = useState(post.reactions);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  const customLabels = extractCustomLabels(post.labels);

  const refreshReactions = async () => {
    const res = await fetch(`/api/posts/${post.id}?_=${Date.now()}`);
    if (res.ok) {
      const data = (await res.json()) as Post;
      setReactions(data.reactions);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定删除这条说说？')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('删除失败');
      onDeleted?.(post.id);
    } catch {
      window.alert('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <PostEditor
          post={post}
          onSaved={(updated) => {
            setEditing(false);
            setReactions(updated.reactions);
            onUpdated?.(updated);
          }}
          onCancel={() => setEditing(false)}
        />
      </article>
    );
  }

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {post.title}
        </h3>
      )}

      <div className="mb-4">
        <MarkdownRenderer content={post.body} />
      </div>

      {customLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {customLabels.map(label => (
            <span
              key={label}
              className="px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <ReactionBar
          targetId={post.id}
          reactions={reactions}
          onReact={refreshReactions}
        />

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{commentCount}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <CommentSection
            issueId={post.id}
            onCommentAdded={() => setCommentCount(count => count + 1)}
          />
        </div>
      )}
    </article>
  );
}
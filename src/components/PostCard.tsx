'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Post } from '@/types';
import { formatRelativeTime, extractCustomLabels } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';
import ReactionBar from './ReactionBar';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  onRefresh?: () => void;
}

export default function PostCard({ post, onRefresh }: PostCardProps) {
  const customLabels = extractCustomLabels(post.labels);
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      {/* Author info */}
      <div className="flex items-center gap-3 mb-4">
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

      {/* Title */}
      {post.title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {post.title}
        </h3>
      )}

      {/* Full content */}
      <div className="mb-4">
        <MarkdownRenderer content={post.body} />
      </div>

      {/* Tags */}
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

      {/* Footer: reactions left, comment icon right */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <ReactionBar
          targetId={post.id}
          reactions={post.reactions}
          onReact={onRefresh}
        />

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.commentCount}</span>
        </button>
      </div>

      {/* Comments (collapsed by default) */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <CommentSection issueId={post.id} />
        </div>
      )}
    </article>
  );
}

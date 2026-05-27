'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatRelativeTime, extractCustomLabels } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const customLabels = extractCustomLabels(post.labels);

  return (
    <Link href={`/post/${post.id}`}>
      <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all cursor-pointer">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-3">
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {post.title}
          </h3>
        )}

        {/* Content preview */}
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-3">
          {post.summary}
        </div>

        {/* Tags */}
        {customLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
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

        {/* Footer: comments + reactions */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {post.commentCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.commentCount}
            </span>
          )}
          {post.reactions.total_count > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.reactions.total_count}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}

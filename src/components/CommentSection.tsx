'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { Comment } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';
import ReactionBar from './ReactionBar';

interface CommentSectionProps {
  issueId: number;
  embedded?: boolean;
  onCommentAdded?: () => void;
}

export default function CommentSection({
  issueId,
  embedded = false,
  onCommentAdded,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch(`/api/comments?issueId=${issueId}`);
        if (res.ok) {
          const data = (await res.json()) as Comment[];
          if (active) setComments(data);
        }
      } finally {
        if (active) setFetching(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [issueId]);

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?issueId=${issueId}`);
    if (res.ok) {
      setComments(await res.json());
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, body: newComment }),
      });
      const data = (await res.json()) as Comment & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? '评论失败');
      }
      setComments(prev => [...prev, data]);
      setNewComment('');
      onCommentAdded?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : '评论失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={
        embedded
          ? ''
          : 'mt-8 border-t border-gray-200 dark:border-gray-700 pt-8'
      }
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        评论 ({comments.length})
      </h3>

      {fetching ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">加载中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">暂无评论</div>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Image
                src={comment.author.avatarUrl}
                alt={comment.author.login}
                width={32}
                height={32}
                className="rounded-full mt-1 self-start flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {comment.author.login}
                  </span>
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(comment.createdAt)}
                  </time>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <MarkdownRenderer content={comment.body} />
                </div>
                <div className="mt-2">
                  <ReactionBar
                    targetId={comment.id}
                    reactions={comment.reactions}
                    isComment
                    onReact={fetchComments}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {session ? (
        <div className="flex gap-3">
          <Image
            src={session.user?.image || `https://github.com/${session.user?.login}.png`}
            alt={session.user?.login || ''}
            width={32}
            height={32}
            className="rounded-full mt-1 self-start flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论... (支持 Markdown)"
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
            {error && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmit}
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '发送中...' : '发表评论'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <button
            onClick={() => signIn('github')}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            登录 GitHub 后评论
          </button>
        </div>
      )}
    </section>
  );
}
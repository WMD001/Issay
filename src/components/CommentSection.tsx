'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  /** 默认展示的最新顶级评论数量，超出部分折叠 */
  defaultVisible?: number;
}

interface CommentNode extends Comment {
  children: CommentNode[];
}

function buildCommentTree(comments: Comment[]): CommentNode[] {
  const nodes = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id);
    if (!node) continue;

    const parent = comment.replyTo ? nodes.get(comment.replyTo.id) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

interface CommentItemProps {
  node: CommentNode;
  canReply: boolean;
  onReply: (comment: Comment) => void;
  onReactRefresh: () => void;
}

function CommentItem({
  node,
  canReply,
  onReply,
  onReactRefresh,
}: CommentItemProps) {
  return (
    <div className="flex gap-2.5">
      <Image
        src={node.author.avatarUrl}
        alt={node.author.login}
        width={28}
        height={28}
        className="rounded-full mt-0.5 self-start flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {node.author.login}
          </span>
          {node.replyTo && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              回复 @{node.replyTo.login}
            </span>
          )}
          <time className="text-xs text-gray-500 dark:text-gray-400">
            {formatRelativeTime(node.createdAt)}
          </time>
          {canReply && (
            <button
              onClick={() => onReply(node)}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              回复
            </button>
          )}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <MarkdownRenderer content={node.body} />
        </div>
        <div className="mt-1">
          <ReactionBar
            targetId={node.id}
            reactions={node.reactions}
            isComment
            onReact={onReactRefresh}
          />
        </div>

        {node.children.length > 0 && (
          <div className="mt-2.5 space-y-2.5 border-l border-gray-200 dark:border-gray-700 pl-3">
            {node.children.map(child => (
              <CommentItem
                key={child.id}
                node={child}
                canReply={canReply}
                onReply={onReply}
                onReactRefresh={onReactRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({
  issueId,
  embedded = false,
  onCommentAdded,
  defaultVisible = 5,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const roots = useMemo(() => buildCommentTree(comments), [comments]);
  const visibleRoots =
    expanded || defaultVisible <= 0 ? roots : roots.slice(-defaultVisible);
  const hiddenCount = roots.length - visibleRoots.length;

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

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comments?issueId=${issueId}`);
    if (res.ok) {
      setComments(await res.json());
    }
  }, [issueId]);

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    setComposerOpen(true);
    setError('');
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleOpenComposer = () => {
    setReplyTo(null);
    setError('');
    setComposerOpen(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleCloseComposer = () => {
    setComposerOpen(false);
    setReplyTo(null);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId,
          body: newComment,
          replyToId: replyTo?.id,
          replyToLogin: replyTo?.author.login,
        }),
      });
      const data = (await res.json()) as Comment & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? '评论失败');
      }
      setComments(prev => [...prev, data]);
      setNewComment('');
      setReplyTo(null);
      setComposerOpen(false);
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
          : 'mt-6 border-t border-gray-200 dark:border-gray-700 pt-6'
      }
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          评论 ({comments.length})
        </h3>
        {session ? (
          composerOpen ? (
            <button
              onClick={handleCloseComposer}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              收起
            </button>
          ) : (
            <button
              onClick={handleOpenComposer}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              写评论
            </button>
          )
        ) : (
          <button
            onClick={() => signIn('github')}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            登录后评论
          </button>
        )}
      </div>

      {fetching ? (
        <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          加载中...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
          暂无评论
        </div>
      ) : (
        <div>
          {!expanded && hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="mb-2.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              展开全部 {comments.length} 条评论
            </button>
          )}

          <div className="space-y-3">
            {visibleRoots.map(comment => (
              <CommentItem
                key={comment.id}
                node={comment}
                canReply={Boolean(session)}
                onReply={handleReply}
                onReactRefresh={fetchComments}
              />
            ))}
          </div>

          {expanded && roots.length > defaultVisible && (
            <button
              onClick={() => setExpanded(false)}
              className="mt-2.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
            >
              收起
            </button>
          )}
        </div>
      )}

      {session && composerOpen && (
        <div className="flex gap-2.5 mt-3">
          <Image
            src={session.user?.image || `https://github.com/${session.user?.login}.png`}
            alt={session.user?.login || ''}
            width={28}
            height={28}
            className="rounded-full mt-0.5 self-start flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1 text-xs text-gray-500 dark:text-gray-400">
              <span>
                {replyTo ? `回复 @${replyTo.author.login}` : '发表评论'}
              </span>
              <button
                onClick={handleCloseComposer}
                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                replyTo
                  ? `回复 @${replyTo.author.login}... (支持 Markdown)`
                  : '写下你的评论... (支持 Markdown)'
              }
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
            {error && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="flex justify-end mt-1.5">
              <button
                onClick={handleSubmit}
                disabled={loading || !newComment.trim()}
                className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '发送中...' : '发表评论'}
              </button>
            </div>
          </div>
        </div>

      )}
    </section>
  );
}
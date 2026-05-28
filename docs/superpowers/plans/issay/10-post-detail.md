# Task 10: 说说详情页（评论 + 表情）

**Files:**
- Create: `src/components/CommentSection.tsx`
- Create: `src/components/ReactionBar.tsx`
- Create: `src/app/post/[id]/page.tsx`

## Steps

- [ ] **Step 1: 创建 ReactionBar 组件**

```tsx
// src/components/ReactionBar.tsx
'use client';

import { useSession } from 'next-auth/react';
import { Reactions } from '@/types';

interface ReactionBarProps {
  targetId: number;
  reactions: Reactions;
  isComment?: boolean;
  onReact?: () => void;
}

const REACTION_EMOJIS: Record<string, string> = {
  '+1': '👍',
  '-1': '👎',
  laugh: '😄',
  hooray: '🎉',
  confused: '😕',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀',
};

export default function ReactionBar({ targetId, reactions, isComment = false, onReact }: ReactionBarProps) {
  const { data: session } = useSession();

  const handleReact = async (content: string) => {
    if (!session) return;

    await fetch('/api/comments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, content, isComment }),
    });

    onReact?.();
  };

  const activeReactions = Object.entries(REACTION_EMOJIS)
    .filter(([key]) => (reactions as any)[key] > 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {activeReactions.map(([key, emoji]) => (
        <button
          key={key}
          onClick={() => handleReact(key)}
          disabled={!session}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:cursor-not-allowed"
          title={session ? '点击添加反应' : '登录后可添加反应'}
        >
          <span>{emoji}</span>
          <span className="text-gray-600 dark:text-gray-300">{(reactions as any)[key]}</span>
        </button>
      ))}

      {/* 添加新反应按钮 */}
      {session && (
        <div className="relative group">
          <button className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            +
          </button>
          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {Object.entries(REACTION_EMOJIS).map(([key, emoji]) => (
              <button
                key={key}
                onClick={() => handleReact(key)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title={key}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建 CommentSection 组件**

```tsx
// src/components/CommentSection.tsx
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
}

export default function CommentSection({ issueId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?issueId=${issueId}`);
    if (res.ok) {
      setComments(await res.json());
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchComments();
  }, [issueId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId, body: newComment }),
    });

    if (res.ok) {
      const comment = await res.json();
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
    setLoading(false);
  };

  return (
    <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        评论 ({comments.length})
      </h3>

      {/* 评论列表 */}
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
                className="rounded-full mt-1"
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

      {/* 发表评论 */}
      {session ? (
        <div className="flex gap-3">
          <Image
            src={session.user?.image || ''}
            alt={session.user?.name || ''}
            width={32}
            height={32}
            className="rounded-full mt-1"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论... (支持 Markdown)"
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmit}
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
```

- [ ] **Step 3: 创建说说详情页面**

```tsx
// src/app/post/[id]/page.tsx
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
        <Link href="/" className="text-primary hover:underline">返回首页</Link>
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
                className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark"
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
```

- [ ] **Step 4: 验证页面功能**

```bash
cd D:/workspace_owner/Issay
npm run dev
```

Expected: 点击首页卡片跳转到详情页，Markdown 正确渲染，评论区显示

- [ ] **Step 5: 提交**

```bash
cd D:/workspace_owner/Issay
git add src/components/ReactionBar.tsx src/components/CommentSection.tsx src/app/post/
git commit -m "feat: add post detail page with comments and reactions"
```

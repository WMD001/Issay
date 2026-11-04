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

  const reactionCounts = reactions as unknown as Record<string, number>;
  const activeReactions = Object.entries(REACTION_EMOJIS)
    .filter(([key]) => reactionCounts[key] > 0);

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
          <span className="text-gray-600 dark:text-gray-300">{reactionCounts[key]}</span>
        </button>
      ))}

      {/* 添加新反应按钮 */}
      {session && (
        <div className="relative group">
          <button className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm3.82 1.636a.75.75 0 0 1 1.038.175l.007.009c.103.118.22.222.35.31.264.178.683.37 1.285.37.602 0 1.02-.192 1.285-.371.13-.088.247-.192.35-.31l.007-.008a.75.75 0 0 1 1.222.87l-.022-.015c.02.013.021.015.021.015v.001l-.001.002-.002.003-.005.007-.014.019a2.066 2.066 0 0 1-.184.213c-.16.166-.338.316-.53.445-.63.418-1.37.638-2.127.629-.946 0-1.652-.308-2.126-.63a3.331 3.331 0 0 1-.715-.657l-.014-.02-.005-.006-.002-.003v-.002h-.001l.613-.432-.614.43a.75.75 0 0 1 .183-1.044ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM5 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm5.25 2.25.592.416a97.71 97.71 0 0 0-.592-.416Z" />
            </svg>
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

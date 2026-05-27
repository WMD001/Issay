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

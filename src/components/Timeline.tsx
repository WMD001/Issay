'use client';

import { Post, TimelineGroup } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface TimelineProps {
  posts: Post[];
  groups: TimelineGroup;
  selectedDate: { year: number; month: number; day: number } | null;
  onSelectDate: (year: number, month: number, day: number) => void;
}

export default function Timeline({ posts, groups, selectedDate, onSelectDate }: TimelineProps) {
  return (
    <div className="flex gap-8">
      <aside className="w-48 flex-shrink-0 hidden lg:block">
        <div className="sticky top-20 space-y-1 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          {groups.years.map(yearGroup => (
            <div key={yearGroup.year} className="mb-4">
              <button
                onClick={() => onSelectDate(yearGroup.year, 0, 0)}
                className={`w-full text-left text-sm font-medium px-2 py-1 rounded ${
                  selectedDate?.year === yearGroup.year &&
                  selectedDate?.month === 0 &&
                  selectedDate?.day === 0
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {yearGroup.year} 年
              </button>

              {yearGroup.months.map(monthGroup => (
                <div key={monthGroup.month} className="mb-3 ml-2 mt-1">
                  <button
                    onClick={() =>
                      onSelectDate(yearGroup.year, monthGroup.month, 0)
                    }
                    className={`w-full text-left text-sm px-2 py-1 rounded ${
                      selectedDate?.year === yearGroup.year &&
                      selectedDate?.month === monthGroup.month &&
                      selectedDate?.day === 0
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {monthGroup.month} 月
                  </button>

                  <div className="ml-3 mt-1 space-y-0.5">
                    {monthGroup.days.map(dayGroup => (
                      <button
                        key={dayGroup.day}
                        onClick={() =>
                          onSelectDate(
                            yearGroup.year,
                            monthGroup.month,
                            dayGroup.day
                          )
                        }
                        className={`w-full text-left text-xs px-2 py-0.5 rounded flex items-center justify-between ${
                          selectedDate?.year === yearGroup.year &&
                          selectedDate?.month === monthGroup.month &&
                          selectedDate?.day === dayGroup.day
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
                            : 'text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <span>{dayGroup.day} 日</span>
                        <span className="text-gray-400 dark:text-gray-600">{dayGroup.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            该时间段暂无说说
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <a
                key={post.id}
                href={`/post/${post.id}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {post.title && (
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                        {post.title}
                      </h4>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {post.summary}
                    </p>
                  </div>
                  <time className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatRelativeTime(post.createdAt)}
                  </time>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
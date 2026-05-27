'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => Promise<boolean>;  // 返回 false 表示没有更多
  children: React.ReactNode;
}

export default function InfiniteScroll({ onLoadMore, children }: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleIntersect = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading && hasMore) {
        setLoading(true);
        try {
          const more = await onLoadMore();
          setHasMore(more);
        } catch {
          setHasMore(false);
        }
        setLoading(false);
      }
    },
    [loading, hasMore, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div>
      {children}
      <div ref={sentinelRef} className="h-4" />
      {loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          加载中...
        </div>
      )}
      {!hasMore && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          没有更多了
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  labels?: string[];
}

export default function SearchBar({ labels = [] }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedLabel, setSelectedLabel] = useState(searchParams.get('label') || '');

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (selectedLabel) params.set('label', selectedLabel);
    router.push(`/?${params.toString()}`);
  }, [keyword, selectedLabel, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setKeyword('');
    setSelectedLabel('');
    router.push('/');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索说说..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {labels.length > 0 && (
        <select
          value={selectedLabel}
          onChange={(e) => setSelectedLabel(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">全部标签</option>
          {labels.map(label => (
            <option key={label} value={label}>{label}</option>
          ))}
        </select>
      )}

      <button
        onClick={handleSearch}
        className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        搜索
      </button>

      {(keyword || selectedLabel) && (
        <button
          onClick={handleClear}
          className="px-3 py-2 text-sm rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          清除
        </button>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

interface TagFilterProps {
  selected: string;
  onSelect: (label: string) => void;
}

export default function TagFilter({ selected, onSelect }: TagFilterProps) {
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/labels')
      .then(res => (res.ok ? res.json() : { labels: [] }))
      .then((data: { labels?: string[] }) => {
        if (active) {
          setLabels(data.labels ?? []);
        }
      })
      .catch(() => {
        if (active) {
          setLabels([]);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <button
        onClick={() => onSelect('')}
        className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
          selected
            ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
        }`}
      >
        全部
      </button>
      {labels.map(label => (
        <button
          key={label}
          onClick={() => onSelect(selected === label ? '' : label)}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            selected === label
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
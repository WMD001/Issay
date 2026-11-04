'use client';

import { useState } from 'react';
import { Post } from '@/types';
import { extractCustomLabels } from '@/lib/utils';

interface PostEditorProps {
  post: Post;
  onSaved: (post: Post) => void;
  onCancel: () => void;
}

export default function PostEditor({ post, onSaved, onCancel }: PostEditorProps) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [labels, setLabels] = useState(extractCustomLabels(post.labels).join(', '));
  const [isDraft, setIsDraft] = useState(post.isDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!body.trim()) {
      setError('内容不能为空');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          labels: labels
            .split(/[,，]/)
            .map(label => label.trim())
            .filter(Boolean),
          isDraft,
        }),
      });
      const data = (await res.json()) as Post & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? '保存失败');
      }
      onSaved(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="说说内容... (支持 Markdown)"
        rows={6}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
      />
      <input
        type="text"
        value={labels}
        onChange={(e) => setLabels(e.target.value)}
        placeholder="标签，用逗号分隔"
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isDraft}
            onChange={(e) => setIsDraft(e.target.checked)}
            className="rounded border-gray-300"
          />
          保存为草稿
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !body.trim()}
            className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
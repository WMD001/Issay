'use client';

import { useState, useRef } from 'react';
import { Post } from '@/types';
import { useAdmin } from '@/lib/useAdmin';

interface PostCreatorProps {
  onCreated?: (post?: Post) => void;
}

const MAX_UPLOAD_SIZE = 4 * 1024 * 1024;

export default function PostCreator({ onCreated }: PostCreatorProps) {
  const isAdmin = useAdmin();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [labels, setLabels] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return null;

  const reset = () => {
    setTitle('');
    setBody('');
    setLabels('');
    setError('');
    setExpanded(false);
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!body.trim()) {
      setError('内容不能为空');
      return;
    }

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          isDraft,
          labels: labels
            .split(/[,，]/)
            .map(label => label.trim())
            .filter(Boolean),
        }),
      });
      const data = (await res.json()) as Post & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? '发布失败');
      }
      reset();
      onCreated?.(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '发布失败');
    } finally {
      setSending(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_SIZE) {
      setError('图片不能超过 4MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = (await res.json()) as { markdown?: string; error?: string };
      if (!res.ok || !data.markdown) {
        throw new Error(data.error ?? '上传失败');
      }
      setBody(prev => prev + (prev ? '\n' : '') + data.markdown);
    } catch (e) {
      setError(e instanceof Error ? e.message : '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-left px-3 py-2 text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          写点什么...
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题（可选）"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="说说内容... (支持 Markdown)"
            rows={4}
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
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                {uploading ? '上传中...' : '📷 图片'}
              </button>
              <button
                onClick={reset}
                className="px-3 py-1.5 text-xs rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                取消
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSubmit(true)}
                disabled={sending || !body.trim()}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                存草稿
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={sending || !body.trim()}
                className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? '发送中...' : '发布'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useRef } from 'react';
import { useAdmin } from '@/lib/useAdmin';

interface PostCreatorProps {
  onCreated?: (post?: any) => void;
}

export default function PostCreator({ onCreated }: PostCreatorProps) {
  const isAdmin = useAdmin();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return null;

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, isDraft: false }),
      });
      if (res.ok) {
        const data = await res.json();
        setTitle('');
        setBody('');
        setExpanded(false);
        onCreated?.(data);
      }
    } finally {
      setSending(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      setBody(prev => prev + (prev ? '\n' : '') + data.markdown);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            placeholder="标题"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="说说内容... (支持 Markdown)"
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                📷 图片
              </button>
              <button
                onClick={() => { setExpanded(false); setTitle(''); setBody(''); }}
                className="px-3 py-1.5 text-xs rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                取消
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={sending || !body.trim()}
              className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? '发送中...' : '发布'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

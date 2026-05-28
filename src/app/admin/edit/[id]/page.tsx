'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/types';
import { hasLabel } from '@/lib/utils';
import AdminGuard from '@/components/AdminGuard';
import MarkdownRenderer from '@/components/MarkdownRenderer';

function EditPostContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const post: Post = await res.json();
        setTitle(post.title);
        setBody(post.body);
        setIsDraft(hasLabel(post.labels, 'draft'));
      } catch {
        alert('加载失败');
        router.push('/admin');
      }
      setLoading(false);
    };
    fetchPost();
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setBody(prev => prev + (prev ? '\n' : '') + data.markdown);
    } catch {
      alert('图片上传失败');
    }
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!body.trim()) {
      alert('内容不能为空');
      return;
    }
    setSaving(true);
    try {
      const labels = ['shuoshuo'];
      if (isDraft) labels.push('draft');

      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, labels }),
      });
      if (!res.ok) throw new Error('Failed to update');
      router.push('/admin');
    } catch {
      alert('保存失败');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          编辑说说
        </h1>
        <Link
          href="/admin"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          返回列表
        </Link>
      </div>

      <div className="space-y-4">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            标题（可选）
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="输入标题..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 编辑器 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              内容
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {uploading ? '上传中...' : '上传图片'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="输入 Markdown 内容..."
              rows={16}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            />
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-y-auto min-h-[200px] max-h-[400px] bg-gray-50 dark:bg-gray-900/50">
              {body ? (
                <MarkdownRenderer content={body} />
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  预览区域
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 状态 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            状态
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={!isDraft}
                onChange={() => setIsDraft(false)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                已发布
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={isDraft}
                onChange={() => setIsDraft(true)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                草稿
              </span>
            </label>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EditPostContent />
      </div>
    </AdminGuard>
  );
}

'use client';

import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { isAdmin } from '@/lib/utils';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
        加载中...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">请先登录</p>
        <button
          onClick={() => signIn('github')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          GitHub 登录
        </button>
      </div>
    );
  }

  if (!isAdmin(session.user?.login)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">无权访问</p>
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

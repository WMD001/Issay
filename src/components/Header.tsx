'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import { isAdmin } from '@/lib/utils';

export default function Header() {
  const { data: session } = useSession();
  const isOwner = isAdmin(session?.user?.login);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          Issay
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/timeline" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            时间线
          </Link>
          {isOwner && (
            <Link href="/admin" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              管理
            </Link>
          )}
          <ThemeToggle />
          {session ? (
            <button onClick={() => signOut()} className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              退出
            </button>
          ) : (
            <button onClick={() => signIn('github')} className="text-sm px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              GitHub 登录
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

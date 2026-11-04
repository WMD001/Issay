'use client';

import { useSession } from 'next-auth/react';

export function useAdmin(): boolean {
  const { data, status } = useSession();
  return status === 'authenticated' && Boolean(data?.user?.isAdmin);
}
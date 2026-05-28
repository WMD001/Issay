'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAdmin() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (session) {
      fetch('/api/auth/session')
        .then(res => res.json())
        .then(data => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  return isAdmin;
}

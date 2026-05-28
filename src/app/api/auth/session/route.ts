import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ session: null, isAdmin: false });
  }

  return NextResponse.json({
    session,
    isAdmin: isAdmin((session as any).user?.login),
  });
}

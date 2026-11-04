import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsedLabels } from '@/lib/github';
import { getAccessToken, getAnonymousReadToken } from '@/lib/server-auth';

/** GET /api/labels — 获取说说中实际使用的标签 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const token = await getAccessToken(request);
    const readToken =
      token ?? (session?.user ? undefined : getAnonymousReadToken());
    const labels = await getUsedLabels(readToken);
    return NextResponse.json({ labels });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
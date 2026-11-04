import { NextRequest, NextResponse } from 'next/server';
import { getCustomLabels } from '@/lib/github';
import { getAccessToken } from '@/lib/server-auth';

/** GET /api/labels — 获取用于筛选的自定义标签 */
export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    const labels = await getCustomLabels(token);
    return NextResponse.json({ labels });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getCustomLabels } from '@/lib/github';

/** GET /api/labels — 获取用于筛选的自定义标签 */
export async function GET() {
  try {
    const labels = await getCustomLabels();
    return NextResponse.json({ labels });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPost, updatePost, closePost } from '@/lib/github';
import { isAdmin } from '@/lib/utils';
import { ExtendedSession } from '@/types';

/** GET /api/posts/[id] — 获取单条说说 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const token = (session as ExtendedSession | null)?.accessToken;

    const post = await getPost(parseInt(id, 10), token);
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/** PATCH /api/posts/[id] — 更新说说（仅管理员） */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const extSession = session as ExtendedSession | null;

    if (!extSession?.accessToken || !isAdmin(extSession.user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const post = await updatePost(parseInt(id, 10), data);
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/** DELETE /api/posts/[id] — 关闭说说（仅管理员） */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const extSession = session as ExtendedSession | null;

    if (!extSession?.accessToken || !isAdmin(extSession.user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await closePost(parseInt(id, 10));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

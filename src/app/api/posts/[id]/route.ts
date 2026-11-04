import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPost, updatePost, closePost, type UpdatePostInput } from '@/lib/github';
import { isAdmin, extractCustomLabels } from '@/lib/utils';

interface UpdatePostBody {
  title?: string;
  body?: string;
  labels?: string[];
  isDraft?: boolean;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

/** GET /api/posts/[id] — 获取单条说说 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getPost(Number.parseInt(id, 10));
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
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
    if (!isAdmin(session?.user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = (await request.json()) as UpdatePostBody;
    const postId = Number.parseInt(id, 10);
    const update: UpdatePostInput = {};

    if (typeof data.title === 'string') {
      update.title = data.title;
    }
    if (typeof data.body === 'string') {
      update.body = data.body;
    }

    if (Array.isArray(data.labels) || typeof data.isDraft === 'boolean') {
      const existing = await getPost(postId);
      const customLabels = Array.isArray(data.labels)
        ? data.labels.filter((label): label is string => typeof label === 'string')
        : extractCustomLabels(existing.labels);
      const isDraft =
        typeof data.isDraft === 'boolean' ? data.isDraft : existing.isDraft;

      update.labels = [
        'shuoshuo',
        ...customLabels,
        ...(isDraft ? ['draft'] : []),
      ];
    }

    const post = await updatePost(postId, update);
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
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
    if (!isAdmin(session?.user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await closePost(Number.parseInt(id, 10));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
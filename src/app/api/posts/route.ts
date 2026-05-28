import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPosts, searchPosts, createPost } from '@/lib/github';
import { isAdmin } from '@/lib/utils';
import { ExtendedSession } from '@/types';

/** GET /api/posts?page=1&keyword=xxx&label=xxx&includeDraft=true */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const keyword = searchParams.get('keyword') || undefined;
    const label = searchParams.get('label') || undefined;
    const includeDraft = searchParams.get('includeDraft') === 'true';

    // includeDraft 仅管理员可用
    let showDraft = false;
    if (includeDraft) {
      const session = await getServerSession(authOptions);
      const extSession = session as ExtendedSession | null;
      if (extSession?.accessToken && isAdmin(extSession.user?.login)) {
        showDraft = true;
      }
    }

    const result = keyword
      ? await searchPosts(keyword, label, page)
      : await getPosts(page, 10, showDraft);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/** POST /api/posts — 创建说说（仅管理员） */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const extSession = session as ExtendedSession | null;

    if (!extSession?.accessToken || !isAdmin(extSession.user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, isDraft } = await request.json();

    if (!body) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }

    const labels = ['shuoshuo'];
    if (isDraft) labels.push('draft');

    const post = await createPost(title, body, labels, extSession.accessToken);
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

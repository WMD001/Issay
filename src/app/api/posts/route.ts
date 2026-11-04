import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPosts, searchPosts, createPost } from '@/lib/github';
import { isAdmin } from '@/lib/utils';

interface CreatePostBody {
  title?: string;
  body?: string;
  labels?: string[];
  isDraft?: boolean;
}

/** GET /api/posts?page=1&perPage=10&keyword=xxx&label=xxx&includeDraft=true&draftOnly=true */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1;
    const perPage = Number.parseInt(searchParams.get('perPage') ?? '10', 10) || 10;
    const keyword = searchParams.get('keyword')?.trim() || undefined;
    const label = searchParams.get('label')?.trim() || undefined;
    const includeDraft = searchParams.get('includeDraft') === 'true';
    const draftOnly = searchParams.get('draftOnly') === 'true';

    const session = await getServerSession(authOptions);
    const admin = isAdmin(session?.user?.login);

    if ((includeDraft || draftOnly) && !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = keyword
      ? await searchPosts(keyword, label, page)
      : await getPosts({
          page,
          perPage,
          includeDraft: includeDraft && admin,
          label,
          draftOnly: draftOnly && admin,
        });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/posts — 创建说说（仅管理员） */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session?.user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = (await request.json()) as CreatePostBody;
    const body = data.body?.trim();
    if (!body) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }

    const labels = Array.isArray(data.labels)
      ? data.labels.filter((label): label is string => typeof label === 'string')
      : [];
    if (data.isDraft) {
      labels.push('draft');
    }

    const post = await createPost(data.title ?? '', body, labels);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
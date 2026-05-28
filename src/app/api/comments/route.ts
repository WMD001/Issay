import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getComments, createComment, addReaction } from '@/lib/github';
import { ExtendedSession } from '@/types';

/** GET /api/comments?issueId=123 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueIdStr = searchParams.get('issueId');

    if (!issueIdStr) {
      return NextResponse.json(
        { error: 'issueId is required' },
        { status: 400 }
      );
    }

    const issueId = parseInt(issueIdStr, 10);
    const session = await getServerSession(authOptions);
    const token = (session as ExtendedSession | null)?.accessToken;

    const comments = await getComments(issueId, token);
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/** POST /api/comments — 发表评论（需登录） */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const extSession = session as ExtendedSession | null;

    if (!extSession?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { issueId, body } = await request.json();

    if (!issueId || !body) {
      return NextResponse.json(
        { error: 'issueId and body are required' },
        { status: 400 }
      );
    }

    const comment = await createComment(issueId, body);
    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/** PUT /api/comments — 添加表情反应（需登录） */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const extSession = session as ExtendedSession | null;

    if (!extSession?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetId, content, isComment } = await request.json();

    if (!targetId || !content) {
      return NextResponse.json(
        { error: 'targetId and content are required' },
        { status: 400 }
      );
    }

    await addReaction(targetId, content, undefined, isComment);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  getComments,
  createComment,
  addReaction,
  type ReactionContent,
} from '@/lib/github';
import { getAccessToken } from '@/lib/server-auth';

const REACTION_CONTENTS: readonly ReactionContent[] = [
  '+1',
  '-1',
  'laugh',
  'hooray',
  'confused',
  'heart',
  'rocket',
  'eyes',
];

interface CreateCommentBody {
  issueId?: number;
  body?: string;
}

interface ReactionBody {
  targetId?: number;
  content?: string;
  isComment?: boolean;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

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

    const comments = await getComments(Number.parseInt(issueIdStr, 10));
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

/** POST /api/comments — 发表评论（需登录，以登录用户身份写入） */
export async function POST(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { issueId, body } = (await request.json()) as CreateCommentBody;
    if (!issueId || !body?.trim()) {
      return NextResponse.json(
        { error: 'issueId and body are required' },
        { status: 400 }
      );
    }

    const comment = await createComment(issueId, body.trim(), token);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

/** PUT /api/comments — 添加表情反应（需登录，以登录用户身份写入） */
export async function PUT(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetId, content, isComment } =
      (await request.json()) as ReactionBody;

    if (!targetId || !content) {
      return NextResponse.json(
        { error: 'targetId and content are required' },
        { status: 400 }
      );
    }

    if (!REACTION_CONTENTS.includes(content as ReactionContent)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
    }

    await addReaction(
      targetId,
      content as ReactionContent,
      token,
      Boolean(isComment)
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/utils';
import { ExtendedSession } from '@/types';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const GITHUB_API = 'https://api.github.com';

/** POST /api/upload — 上传图片（仅管理员） */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const extSession = session as ExtendedSession | null;

    if (!extSession?.accessToken || !isAdmin(extSession.user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size must be <= 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: png, jpeg, gif, webp, svg' },
        { status: 400 }
      );
    }

    // Convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Upload via GitHub Contents API
    const repo = process.env.GITHUB_REPO;
    if (!repo) {
      return NextResponse.json(
        { error: 'GITHUB_REPO is not configured' },
        { status: 500 }
      );
    }

    const filename = `${Date.now()}-${file.name}`;
    const path = `uploads/${filename}`;

    const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${extSession.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload image: ${filename}`,
        content: base64,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(
        `GitHub API error: ${res.status} - ${error.message || 'Unknown'}`
      );
    }

    const data = await res.json();
    const url = data.content.download_url;

    return NextResponse.json({
      url,
      markdown: `![${file.name}](${url})`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

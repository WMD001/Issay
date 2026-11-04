import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/utils';
import { getAccessToken } from '@/lib/server-auth';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];
const MAX_SIZE = 4 * 1024 * 1024; // 4MB，低于 Vercel 4.5MB 请求体上限

const GITHUB_API = 'https://api.github.com';

function sanitizeFilename(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : 'png';
  const safeBase =
    base.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_').slice(0, 60) || 'image';
  const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'png';
  return `${safeBase}.${safeExt}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

/** POST /api/upload — 上传图片（仅管理员，以登录用户身份写入） */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const token = await getAccessToken(request);
    if (!token || !isAdmin(session?.user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size must be <= 4MB' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: png, jpeg, gif, webp, svg' },
        { status: 400 }
      );
    }

    const repo = process.env.GITHUB_REPO;
    if (!repo) {
      return NextResponse.json(
        { error: 'GITHUB_REPO is not configured' },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const filename = `${Date.now()}-${sanitizeFilename(file.name)}`;
    const path = `uploads/${filename}`;

    const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload image: ${filename}`,
        content: base64,
      }),
    });

    if (!res.ok) {
      const error = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(
        `GitHub API error: ${res.status} - ${error.message ?? 'Unknown'}`
      );
    }

    const data = (await res.json()) as {
      content: { download_url: string };
    };
    const url = data.content.download_url;

    return NextResponse.json({
      url,
      markdown: `![${file.name}](${url})`,
    });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
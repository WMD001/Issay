# Task 7: API Routes - 评论 + 图片上传

**Files:**
- Create: `src/app/api/comments/route.ts`
- Create: `src/app/api/upload/route.ts`

## Steps

- [ ] **Step 1: 创建评论 API**

```typescript
// src/app/api/comments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getComments, createComment, addReaction } from '@/lib/github';

/** GET /api/comments?issueId=123 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = parseInt(searchParams.get('issueId') || '0');
    if (!issueId) {
      return NextResponse.json({ error: 'issueId required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const token = (session as any)?.accessToken;
    const comments = await getComments(issueId, token);
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/** POST /api/comments */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { issueId, body } = await request.json();
    if (!issueId || !body) {
      return NextResponse.json(
        { error: 'issueId and body required' },
        { status: 400 }
      );
    }

    const comment = await createComment(
      issueId,
      body,
      (session as any).accessToken
    );
    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/** PUT /api/comments (添加表情反应) */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetId, content, isComment } = await request.json();
    if (!targetId || !content) {
      return NextResponse.json(
        { error: 'targetId and content required' },
        { status: 400 }
      );
    }

    await addReaction(targetId, content, (session as any).accessToken, isComment);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 创建图片上传 API**

```typescript
// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/utils';

/** POST /api/upload */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin((session as any).user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 限制文件大小 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // 限制文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const repo = process.env.GITHUB_REPO!;
    const token = (session as any).accessToken;
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${Date.now()}-${file.name}`;
    const path = `uploads/${filename}`;

    // 使用 GitHub Contents API 上传
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload image: ${filename}`,
          content: base64,
        }),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.message || 'Upload failed' },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      url: data.content.download_url,
      markdown: `![${file.name}](${data.content.download_url})`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: 验证类型编译通过**

```bash
cd D:/workspace_owner/Issay
npx tsc --noEmit
```

- [ ] **Step 4: 提交**

```bash
cd D:/workspace_owner/Issay
git add src/app/api/comments/ src/app/api/upload/
git commit -m "feat: add comments and image upload API routes"
```

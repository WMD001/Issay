# Task 6: API Routes - 说说 CRUD

**Files:**
- Create: `src/app/api/posts/route.ts`
- Create: `src/app/api/posts/[id]/route.ts`

## Steps

- [ ] **Step 1: 创建说说列表 / 创建 API**

```typescript
// src/app/api/posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPosts, createPost, searchPosts } from '@/lib/github';
import { isAdmin } from '@/lib/utils';

/** GET /api/posts?page=1&keyword=xxx&label=xxx */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const keyword = searchParams.get('keyword') || '';
    const label = searchParams.get('label') || '';

    if (keyword) {
      const result = await searchPosts(keyword, label || undefined, page);
      return NextResponse.json(result);
    }

    const result = await getPosts(page);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/** POST /api/posts */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin((session as any).user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, isDraft } = await request.json();
    const labels = ['shuoshuo'];
    if (isDraft) labels.push('draft');

    const post = await createPost(title, body, labels, (session as any).accessToken);
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 创建单条说说 读/改/删 API**

```typescript
// src/app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPost, updatePost, closePost } from '@/lib/github';
import { isAdmin } from '@/lib/utils';

/** GET /api/posts/[id] */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const token = (session as any)?.accessToken;
    const post = await getPost(parseInt(id), token);
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/** PATCH /api/posts/[id] */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin((session as any).user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const post = await updatePost(
      parseInt(id),
      data,
      (session as any).accessToken
    );
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/** DELETE /api/posts/[id] */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin((session as any).user?.login)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await closePost(parseInt(id), (session as any).accessToken);
    return NextResponse.json({ success: true });
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
git add src/app/api/posts/
git commit -m "feat: add posts CRUD API routes"
```

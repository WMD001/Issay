# Task 4: NextAuth 认证

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

## Steps

- [ ] **Step 1: 创建 NextAuth 配置**

```typescript
// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { ExtendedSession } from '@/types';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'read:user repo' },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        accessToken: token.accessToken as string,
        user: {
          ...session.user,
          login: (token as any).login || session.user?.name,
        },
      };
    },
    async signIn({ user, profile }) {
      // 任何 GitHub 用户都可以登录
      return true;
    },
  },
  pages: {
    signIn: '/',  // 未登录时重定向到首页
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

- [ ] **Step 2: 创建 NextAuth API Route**

```typescript
// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

- [ ] **Step 3: 创建管理员判断工具函数**

在 `src/lib/utils.ts` 中添加：

```typescript
/** 判断是否为管理员 */
export function isAdmin(login?: string | null): boolean {
  if (!login) return false;
  return login === process.env.GITHUB_OWNER;
}
```

- [ ] **Step 4: 验证类型编译通过**

```bash
cd D:/workspace_owner/Issay
npx tsc --noEmit
```

- [ ] **Step 5: 提交**

```bash
cd D:/workspace_owner/Issay
git add src/lib/auth.ts src/app/api/auth/ src/lib/utils.ts
git commit -m "feat: add NextAuth GitHub OAuth authentication"
```

import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function getAccessToken(request: NextRequest): Promise<string | undefined> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token?.accessToken;
}
/** 仅允许未登录访客使用的服务端只读 Token */
export function getAnonymousReadToken(): string | undefined {
  return process.env.GITHUB_TOKEN;
}
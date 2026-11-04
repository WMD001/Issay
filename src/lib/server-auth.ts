import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function getAccessToken(request: NextRequest): Promise<string | undefined> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token?.accessToken;
}
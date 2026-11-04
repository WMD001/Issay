import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { isAdmin } from '@/lib/utils';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      authorization: {
        params: { scope: 'read:user public_repo' },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      const login = (profile as { login?: string } | undefined)?.login;
      if (login) {
        token.login = login;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        login: token.login ?? session.user?.name ?? undefined,
        isAdmin: isAdmin(token.login),
      };
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
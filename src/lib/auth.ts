import { NextAuthOptions, Session } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

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
    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        accessToken: token.accessToken as string,
        user: {
          ...session.user,
          login: (token as any).login || session.user?.name,
        },
      } as Session;
    },
    async signIn({ user, profile }) {
      return true;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

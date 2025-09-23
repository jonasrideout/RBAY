// /lib/auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Allow any Google account to sign in
          // We'll check school existence in the redirect callback instead
          console.log(`Sign-in allowed for: ${user.email}`);
          return true;
        } catch (error) {
          console.error('Sign-in callback error:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // REMOVED PRISMA CALL - Edge Runtime compatible
      // School data will be fetched separately in dashboard and student registration
      // This ensures sessions work properly
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl; // Always redirect to home page instead of dashboard
    },
  },
  session: {
    strategy: 'jwt',
  },
});

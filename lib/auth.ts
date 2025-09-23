// /lib/auth.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
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
      // School data will be fetched separately in dashboard and student registration
      // This ensures sessions work properly
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl; // Always redirect to home page for now
    },
  },
  session: {
    strategy: 'jwt',
  },
});

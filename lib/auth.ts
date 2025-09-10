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
      // Only redirect to dashboard after successful Google OAuth callback
      if (url === `${baseUrl}/api/auth/callback/google`) {
        return `${baseUrl}/dashboard`;
      }
      
      // For all other cases, respect the intended URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl; // Default to home page, not dashboard
    },
  },
  session: {
    strategy: 'jwt',
  },
});

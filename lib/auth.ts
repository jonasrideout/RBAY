// /lib/auth.ts

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

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
          // Check if this email belongs to a registered teacher
          const school = await prisma.school.findUnique({
            where: { teacherEmail: user.email! }
          });

          if (!school) {
            // Teacher email not found in registered schools
            console.log(`Sign-in denied: ${user.email} is not a registered teacher`);
            return false;
          }

          // Allow sign-in for registered teachers
          return true;
        } catch (error) {
          console.error('Sign-in callback error:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          // Get school information for the logged-in teacher
          const school = await prisma.school.findUnique({
            where: { teacherEmail: session.user.email },
            select: {
              id: true,
              schoolName: true,
              teacherName: true,
              dashboardToken: true,
              status: true,
            }
          });

          if (school) {
            // Add school info to session
            session.user.schoolId = school.id;
            session.user.schoolName = school.schoolName;
            session.user.teacherName = school.teacherName;
            session.user.dashboardToken = school.dashboardToken;
            session.user.schoolStatus = school.status;
          }
        } catch (error) {
          console.error('Session callback error:', error);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: 'jwt',
  },
});

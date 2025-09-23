// /app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Create the NextAuth handler
const handler = NextAuth(authOptions);

export async function GET(request: NextRequest, context: any) {
  console.log('NextAuth GET route called:', request.url);
  return handler(request, context);
}

export async function POST(request: NextRequest, context: any) {
  console.log('NextAuth POST route called:', request.url);
  return handler(request, context);
}

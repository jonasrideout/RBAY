// lib/adminAuth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Get admin users from environment variable
function getAdminUsers(): Record<string, string> {
  const adminUsersEnv = process.env.ADMIN_USERS || '';
  const adminUsers: Record<string, string> = {};
  
  if (adminUsersEnv) {
    adminUsersEnv.split(',').forEach(userPair => {
      const [email, password] = userPair.split(':');
      if (email && password) {
        adminUsers[email.trim()] = password.trim();
      }
    });
  }
  
  return adminUsers;
}

// Verify admin credentials
export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminUsers = getAdminUsers();
  return adminUsers[email] === password;
}

// JWT secret key
const secret = new TextEncoder().encode(process.env.ADMIN_TOKEN_SECRET || 'fallback-secret');

// Create admin JWT token
export async function createAdminToken(email: string): Promise<string> {
  const token = await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return token;
}

// Verify admin JWT token
export async function verifyAdminToken(token: string): Promise<{ email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}

// Set admin session cookie
export function setAdminSession(token: string) {
  const cookieStore = cookies();
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

// Clear admin session cookie
export function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete('admin-session');
}

// Get current admin session from cookies
export async function getAdminSession(): Promise<{ email: string; role: string } | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('admin-session')?.value;
  
  if (!token) return null;
  
  return await verifyAdminToken(token);
}

// Middleware helper to check admin session from request
export async function getAdminSessionFromRequest(request: NextRequest): Promise<{ email: string; role: string } | null> {
  const token = request.cookies.get('admin-session')?.value;
  
  if (!token) return null;
  
  return await verifyAdminToken(token);
}

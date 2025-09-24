// /lib/adminAuth.ts
import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.ADMIN_TOKEN_SECRET || 'fallback-secret-key');

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminSession {
  email: string;
  iat: number;
  exp: number;
}

// Parse admin users from environment variable
function getAdminUsers(): Map<string, string> {
  const adminUsers = new Map();
  const adminUsersString = process.env.ADMIN_USERS || '';
  
  adminUsersString.split(',').forEach(userString => {
    const [email, password] = userString.split(':');
    if (email && password) {
      adminUsers.set(email.trim(), password.trim());
    }
  });
  
  return adminUsers;
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminUsers = getAdminUsers();
  const storedPassword = adminUsers.get(email);
  
  return storedPassword === password;
}

export async function createAdminToken(email: string): Promise<string> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
    
  return token;
}

export async function getAdminSession(request: NextRequest): Promise<AdminSession | null> {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const { payload } = await jwtVerify(token, secret);
    
    return {
      email: payload.email as string,
      iat: payload.iat!,
      exp: payload.exp!
    };
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return null;
  }
}

// /lib/adminTokens.ts
import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'fallback-secret-change-in-production';
const TOKEN_EXPIRY_HOURS = 24; // Admin tokens valid for 24 hours

interface AdminTokenPayload {
  schoolId: string;
  schoolToken: string;
  issuedAt: number;
  expiresAt: number;
}

export function generateAdminToken(schoolId: string, schoolToken: string): string {
  const now = Date.now();
  const payload: AdminTokenPayload = {
    schoolId,
    schoolToken,
    issuedAt: now,
    expiresAt: now + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
  };

  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payloadString)
    .digest('hex');

  // Combine payload and signature, then base64 encode
  const token = Buffer.from(`${payloadString}.${signature}`).toString('base64url');
  return token;
}

export function verifyAdminToken(adminToken: string): AdminTokenPayload | null {
  try {
    // Decode the token
    const decoded = Buffer.from(adminToken, 'base64url').toString('utf-8');
    const [payloadString, signature] = decoded.split('.');
    
    if (!payloadString || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payloadString)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    // Parse payload
    const payload: AdminTokenPayload = JSON.parse(payloadString);

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export function generateAdminDashboardUrl(schoolId: string, schoolToken: string): string {
  const adminToken = generateAdminToken(schoolId, schoolToken);
  return `/dashboard?adminToken=${adminToken}`;
}

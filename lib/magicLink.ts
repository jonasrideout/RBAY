// /lib/magicLink.ts
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export interface MagicLinkToken {
  email: string;
  token: string;
  expires: number;
}

export interface TeacherSession {
  email: string;
  loginTime: number;
  expires: number;
}

// Generate secure magic link token
export function generateMagicLinkToken(email: string): MagicLinkToken {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (30 * 60 * 1000); // 30 minutes from now
  
  return {
    email,
    token,
    expires
  };
}

// Verify magic link token
export function verifyMagicLinkToken(tokenData: string, providedToken: string): { valid: boolean; email?: string } {
  try {
    const decoded = JSON.parse(Buffer.from(tokenData, 'base64').toString());
    
    // Check token match
    if (decoded.token !== providedToken) {
      return { valid: false };
    }
    
    // Check expiration
    if (Date.now() > decoded.expires) {
      return { valid: false };
    }
    
    return { valid: true, email: decoded.email };
  } catch (error) {
    return { valid: false };
  }
}

// Create teacher session
export function createTeacherSession(email: string): TeacherSession {
  const loginTime = Date.now();
  const expires = loginTime + (24 * 60 * 60 * 1000); // 24 hours from now
  
  return {
    email,
    loginTime,
    expires
  };
}

// Verify teacher session
export function verifyTeacherSession(sessionData: string): { valid: boolean; session?: TeacherSession; needsWarning?: boolean } {
  try {
    const session: TeacherSession = JSON.parse(Buffer.from(sessionData, 'base64').toString());
    
    const now = Date.now();
    
    // Check if session is expired
    if (now > session.expires) {
      return { valid: false };
    }
    
    // Check if session needs expiration warning (1 hour before expiry)
    const oneHourBeforeExpiry = session.expires - (60 * 60 * 1000);
    const needsWarning = now > oneHourBeforeExpiry;
    
    return { valid: true, session, needsWarning };
  } catch (error) {
    return { valid: false };
  }
}

// Set session cookie
export function setSessionCookie(response: NextResponse, session: TeacherSession): NextResponse {
  const sessionData = Buffer.from(JSON.stringify(session)).toString('base64');
  
  response.cookies.set('teacher-session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    path: '/'
  });
  
  return response;
}

// Clear session cookie
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete('teacher-session');
  return response;
}

// Get session from request
export function getSessionFromRequest(request: NextRequest): { valid: boolean; session?: TeacherSession; needsWarning?: boolean } {
  const sessionCookie = request.cookies.get('teacher-session');
  
  if (!sessionCookie?.value) {
    return { valid: false };
  }
  
  return verifyTeacherSession(sessionCookie.value);
}

// Generate magic link URL
export function generateMagicLinkUrl(baseUrl: string, tokenData: MagicLinkToken): string {
  const encodedData = Buffer.from(JSON.stringify(tokenData)).toString('base64');
  return `${baseUrl}/api/auth/verify-magic-link?token=${encodedData}&verify=${tokenData.token}`;
}

// Create email template for magic link
export function createMagicLinkEmailTemplate(magicLinkUrl: string, teacherEmail: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Your Right Back at You Project Login Link';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Right Back at You Project - Login Link</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { color: #2c5aa0; font-size: 28px; font-weight: bold; margin: 0; }
        .subtitle { color: #666; font-size: 16px; margin: 10px 0 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .login-button { display: inline-block; background: #2c5aa0; color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: 500; margin: 20px 0; }
        .login-button:hover { background: #1e4080; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        .link-text { color: #666; font-size: 12px; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Right Back at You Project</h1>
          <p class="subtitle">Teacher Dashboard Access</p>
        </div>
        
        <div class="content">
          <h2 style="color: #333; margin-top: 0;">Your Login Link is Ready</h2>
          <p>Hello! Click the button below to securely access your teacher dashboard:</p>
          
          <div style="text-align: center;">
            <a href="${magicLinkUrl}" class="login-button">Access Your Dashboard</a>
          </div>
          
          <div class="warning">
            <strong>⏰ Important:</strong> This login link will expire in 30 minutes for your security.
          </div>
          
          <p><strong>If the button doesn't work</strong>, copy and paste this link into your browser:</p>
          <p class="link-text">${magicLinkUrl}</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to: ${teacherEmail}</p>
          <p>The Right Back at You Project by Carolyn Mackler<br>
          Building empathy and connection through literature</p>
          <p style="font-size: 12px; margin-top: 20px;">
            If you didn't request this login link, you can safely ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Right Back at You Project - Login Link

Hello! Use this link to securely access your teacher dashboard:

${magicLinkUrl}

IMPORTANT: This login link will expire in 30 minutes for your security.

This email was sent to: ${teacherEmail}

The Right Back at You Project by Carolyn Mackler
Building empathy and connection through literature

If you didn't request this login link, you can safely ignore this email.
  `;
  
  return { subject, html, text };
}

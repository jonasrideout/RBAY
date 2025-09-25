// /app/api/auth/send-magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendMagicLinkEmail } from '@/lib/email';
import { generateMagicLinkToken, generateMagicLinkUrl } from '@/lib/magicLink';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate magic link token
    const tokenData = generateMagicLinkToken(email);
    
    // Generate magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
    const magicLinkUrl = generateMagicLinkUrl(baseUrl, tokenData);
    
    // Send magic link email using existing infrastructure
    const result = await sendMagicLinkEmail({
      teacherEmail: email,
      magicLinkUrl: magicLinkUrl
    });

    if (!result.success) {
      console.error('Magic link email error:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to send login link' },
        { status: 500 }
      );
    }

    console.log('Magic link sent successfully to:', email);

    return NextResponse.json({
      success: true,
      message: 'Login link sent to your email address'
    });

  } catch (error: any) {
    console.error('Send magic link error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to send login link' },
      { status: 500 }
    );
  }
}

// app/api/admin/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    const adminSession = await getAdminSession(request);

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      email: adminSession.email,
    });
  } catch (error) {
    console.error('Admin session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

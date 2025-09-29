// /app/api/admin/send-welcome-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = request.cookies.get('admin-session');
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teacherEmail, teacherName, schoolName, dashboardToken } = body;

    if (!teacherEmail || !schoolName || !dashboardToken) {
      return NextResponse.json(
        { error: 'Teacher email, school name, and dashboard token are required' },
        { status: 400 }
      );
    }

    // Use the existing sendWelcomeEmail function with admin context flag
    const result = await sendWelcomeEmail({
      teacherName: teacherName || 'Teacher',
      teacherEmail,
      schoolName,
      dashboardToken,
      isAdminCreated: true // Mark this as admin-created
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully'
    });
  } catch (error: any) {
    console.error('Admin welcome email error:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}

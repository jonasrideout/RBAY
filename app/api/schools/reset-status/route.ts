import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { schoolId, status } = await request.json();
    
    if (!schoolId || !status) {
      return NextResponse.json(
        { error: 'School ID and status are required' },
        { status: 400 }
      );
    }

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: { status }
    });

    // Send admin notification if status changed to READY
    if (status === 'READY') {
      try {
        await sendAdminNotification({
          schoolName: updatedSchool.schoolName,
          teacherName: updatedSchool.teacherName,
          teacherEmail: updatedSchool.teacherEmail,
          action: 'ready_for_penpals'
        });
      } catch (error: any) {
        console.warn('Admin notification failed:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      school: updatedSchool 
    });
  } catch (error) {
    console.error('Error resetting school status:', error);
    return NextResponse.json(
      { error: 'Failed to reset school status' },
      { status: 500 }
    );
  }
}

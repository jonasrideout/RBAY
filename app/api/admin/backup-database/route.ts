import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    // Check authorization - either cron secret OR admin session
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isFromCron = authHeader === `Bearer ${cronSecret}`;
    
    // Check if admin is logged in (for manual downloads)
    const isAdmin = request.headers.get('cookie')?.includes('admin-session');
    
    if (!isFromCron && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting database backup...');

    // Fetch all data
    const [schools, groups, students, penpals] = await Promise.all([
      prisma.school.findMany({
        include: {
          students: {
            where: { isActive: true }
          },
          schoolGroup: true
        }
      }),
      prisma.schoolGroup.findMany({
        include: {
          schools: {
            select: {
              id: true,
              schoolName: true,
              teacherName: true,
              teacherEmail: true
            }
          }
        }
      }),
      prisma.student.findMany({
        where: { isActive: true },
        include: {
          penpalConnections: true,
          penpalOf: true
        }
      }),
      prisma.studentPenpal.findMany()
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      summary: {
        schools: schools.length,
        groups: groups.length,
        students: students.length,
        penpals: penpals.length
      },
      data: {
        schools,
        groups,
        students,
        penpals
      }
    };

    console.log('Backup created:', backup.summary);

    // If this is from cron job, email the backup
    if (isFromCron) {
      const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      
      const jsonString = JSON.stringify(backup, null, 2);
      const jsonBuffer = Buffer.from(jsonString);
      
      await resend.emails.send({
        from: 'noreply@carolynmackler.com',
        to: 'rightbackatyou13@gmail.com',
        subject: `PenPal Database Backup - ${timestamp}`,
        text: `Automated database backup from Right Back at You project.

Backup Summary:
- Schools: ${backup.summary.schools}
- Groups: ${backup.summary.groups}
- Students: ${backup.summary.students}
- Pen Pal Connections: ${backup.summary.penpals}

The complete backup is attached as a JSON file.

To restore from this backup, contact your developer or use the restore endpoint.`,
        attachments: [
          {
            filename: `penpal-backup-${new Date().toISOString().split('T')[0]}.json`,
            content: jsonBuffer
          }
        ]
      });

      console.log('Backup email sent successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Backup emailed',
        summary: backup.summary 
      });
    }

    // If this is manual (from admin), return JSON for download
    return NextResponse.json(backup);

  } catch (error) {
    console.error('Backup failed:', error);
    return NextResponse.json(
      { 
        error: 'Backup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendPenPalAssignmentEmail } from '@/lib/email';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { unit1Id, unit2Id, matchType } = body;

    if (!unit1Id || !unit2Id || !matchType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Collect all schools that need emails
    const schoolsToEmail: Array<{
      id: string;
      schoolName: string;
      teacherName: string;
      teacherEmail: string;
      partnerSchoolNames: string[];
    }> = [];

    // Collect schools based on match type
    if (matchType === 'school-school') {
      const schools = await prisma.school.findMany({
        where: { id: { in: [unit1Id, unit2Id] } },
        select: {
          id: true,
          schoolName: true,
          teacherName: true,
          teacherEmail: true
        }
      });
      
      for (const school of schools) {
        // Get the other school's name
        const otherSchoolId = school.id === unit1Id ? unit2Id : unit1Id;
        const otherSchool = await prisma.school.findUnique({
          where: { id: otherSchoolId },
          select: { schoolName: true }
        });
        
        schoolsToEmail.push({
          ...school,
          partnerSchoolNames: otherSchool ? [otherSchool.schoolName] : []
        });
      }
    } else if (matchType === 'group-group') {
      const schools = await prisma.school.findMany({
        where: {
          schoolGroupId: { in: [unit1Id, unit2Id] }
        },
        select: {
          id: true,
          schoolName: true,
          teacherName: true,
          teacherEmail: true,
          schoolGroupId: true
        }
      });
      
      for (const school of schools) {
        // Get all schools from the OTHER group
        const otherGroupId = school.schoolGroupId === unit1Id ? unit2Id : unit1Id;
        const otherGroupSchools = await prisma.school.findMany({
          where: { schoolGroupId: otherGroupId },
          select: { schoolName: true }
        });
        
        schoolsToEmail.push({
          id: school.id,
          schoolName: school.schoolName,
          teacherName: school.teacherName,
          teacherEmail: school.teacherEmail,
          partnerSchoolNames: otherGroupSchools.map(s => s.schoolName)
        });
      }
    } else if (matchType === 'group-school') {
      // Determine which unit is the group and which is the school
      let groupId: string | null = null;
      let standaloneSchoolId: string | null = null;
      
      if (!unit1Id.includes(':') && !unit2Id.includes(':')) {
        // Old format: both are direct IDs, need to check which is which
        const unit1 = await prisma.schoolGroup.findUnique({ where: { id: unit1Id } });
        if (unit1) {
          groupId = unit1Id;
          standaloneSchoolId = unit2Id;
        } else {
          groupId = unit2Id;
          standaloneSchoolId = unit1Id;
        }
      } else {
        // New format: one has marker
        if (unit1Id.startsWith('school:')) {
          standaloneSchoolId = unit1Id.replace('school:', '');
          groupId = unit2Id;
        } else if (unit2Id.startsWith('school:')) {
          standaloneSchoolId = unit2Id.replace('school:', '');
          groupId = unit1Id;
        } else if (unit1Id.startsWith('group:')) {
          groupId = unit1Id.replace('group:', '');
          standaloneSchoolId = unit2Id;
        } else if (unit2Id.startsWith('group:')) {
          groupId = unit2Id.replace('group:', '');
          standaloneSchoolId = unit1Id;
        }
      }
      
      if (!groupId || !standaloneSchoolId) {
        throw new Error('Could not determine group and school IDs');
      }
      
      // Get standalone school details
      const standaloneSchool = await prisma.school.findUnique({
        where: { id: standaloneSchoolId },
        select: {
          id: true,
          schoolName: true,
          teacherName: true,
          teacherEmail: true
        }
      });
      
      // Get all schools from the group
      const groupSchools = await prisma.school.findMany({
        where: { schoolGroupId: groupId },
        select: {
          id: true,
          schoolName: true,
          teacherName: true,
          teacherEmail: true
        }
      });
      
      // Add emails for all group schools (they see the standalone school name)
      if (standaloneSchool) {
        for (const groupSchool of groupSchools) {
          schoolsToEmail.push({
            id: groupSchool.id,
            schoolName: groupSchool.schoolName,
            teacherName: groupSchool.teacherName,
            teacherEmail: groupSchool.teacherEmail,
            partnerSchoolNames: [standaloneSchool.schoolName]
          });
        }
        
        // Add email for standalone school (they see all group school names)
        schoolsToEmail.push({
          id: standaloneSchool.id,
          schoolName: standaloneSchool.schoolName,
          teacherName: standaloneSchool.teacherName,
          teacherEmail: standaloneSchool.teacherEmail,
          partnerSchoolNames: groupSchools.map(s => s.schoolName)
        });
      }
    }

    // Send emails to all schools
    const emailResults = await Promise.all(
      schoolsToEmail.map(school =>
        sendPenPalAssignmentEmail({
          teacherName: school.teacherName,
          teacherEmail: school.teacherEmail,
          schoolName: school.schoolName,
          partnerSchoolNames: school.partnerSchoolNames,
        })
      )
    );

    // Check if all emails sent successfully
    const allSuccess = emailResults.every(result => result.success);
    const failedEmails = emailResults
      .map((result, index) => ({ result, school: schoolsToEmail[index] }))
      .filter(({ result }) => !result.success)
      .map(({ school }) => school.teacherEmail);

    if (allSuccess) {
      // Update notificationEmailsSent flag for all schools
      await prisma.school.updateMany({
        where: {
          id: { in: schoolsToEmail.map(s => s.id) }
        },
        data: {
          notificationEmailsSent: true
        }
      });

      return NextResponse.json({
        success: true,
        message: `Successfully sent emails to ${schoolsToEmail.length} teacher(s)`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Failed to send emails to: ${failedEmails.join(', ')}`,
        failedEmails
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending pen pal emails:', error);
    return NextResponse.json(
      { error: 'Failed to send pen pal assignment emails' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

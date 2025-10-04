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
      dashboardToken: string;
      partnerSchoolNames: string[];
    }> = [];

    // Helper to get partner school names for a school
    const getPartnerNames = async (schoolId: string, isInGroup: boolean, groupId?: string) => {
      const names: string[] = [];
      
      if (matchType === 'school-school') {
        // Simple case: just get the other school
        const otherSchoolId = schoolId === unit1Id ? unit2Id : unit1Id;
        const otherSchool = await prisma.school.findUnique({
          where: { id: otherSchoolId },
          select: { schoolName: true }
        });
        if (otherSchool) names.push(otherSchool.schoolName);
      } else if (matchType === 'group-group') {
        // Get all schools from the OTHER group
        const thisSchool = await prisma.school.findUnique({
          where: { id: schoolId },
          select: { schoolGroupId: true }
        });
        
        const otherGroupId = thisSchool?.schoolGroupId === unit1Id ? unit2Id : unit1Id;
        const otherGroupSchools = await prisma.school.findMany({
          where: { schoolGroupId: otherGroupId },
          select: { schoolName: true }
        });
        names.push(...otherGroupSchools.map(s => s.schoolName));
      } else if (matchType === 'group-school') {
        // Determine if this school is in the group or is the standalone school
        const thisSchool = await prisma.school.findUnique({
          where: { id: schoolId },
          select: { schoolGroupId: true }
        });
        
        if (thisSchool?.schoolGroupId) {
          // This school is in the group, partner is the standalone school
          const standaloneSchoolId = unit1Id.startsWith('school:') ? unit1Id.replace('school:', '') : 
                                      unit2Id.startsWith('school:') ? unit2Id.replace('school:', '') : null;
          if (standaloneSchoolId) {
            const standaloneSchool = await prisma.school.findUnique({
              where: { id: standaloneSchoolId },
              select: { schoolName: true }
            });
            if (standaloneSchool) names.push(standaloneSchool.schoolName);
          }
        } else {
          // This is the standalone school, partners are all schools in the group
          const groupId = unit1Id.startsWith('group:') ? unit1Id.replace('group:', '') : 
                         unit2Id.startsWith('group:') ? unit2Id.replace('group:', '') : null;
          if (groupId) {
            const groupSchools = await prisma.school.findMany({
              where: { schoolGroupId: groupId },
              select: { schoolName: true }
            });
            names.push(...groupSchools.map(s => s.schoolName));
          }
        }
      }
      
      return names;
    };

    // Collect schools based on match type
    if (matchType === 'school-school') {
      const schools = await prisma.school.findMany({
        where: { id: { in: [unit1Id, unit2Id] } },
        select: {
          id: true,
          schoolName: true,
          teacherName: true,
          teacherEmail: true,
          dashboardToken: true
        }
      });
      
      for (const school of schools) {
        const partnerNames = await getPartnerNames(school.id, false);
        schoolsToEmail.push({
          ...school,
          partnerSchoolNames: partnerNames
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
          dashboardToken: true
        }
      });
      
      for (const school of schools) {
        const partnerNames = await getPartnerNames(school.id, true);
        schoolsToEmail.push({
          ...school,
          partnerSchoolNames: partnerNames
        });
      }
    } else if (matchType === 'group-school') {
      // Get schools from both the group and the standalone school
      const groupId = unit1Id.startsWith('group:') ? unit1Id.replace('group:', '') : 
                     unit2Id.startsWith('group:') ? unit2Id.replace('group:', '') : null;
      const schoolId = unit1Id.startsWith('school:') ? unit1Id.replace('school:', '') : 
                      unit2Id.startsWith('school:') ? unit2Id.replace('school:', '') : null;
      
      if (groupId) {
        const groupSchools = await prisma.school.findMany({
          where: { schoolGroupId: groupId },
          select: {
            id: true,
            schoolName: true,
            teacherName: true,
            teacherEmail: true,
            dashboardToken: true
          }
        });
        
        for (const school of groupSchools) {
          const partnerNames = await getPartnerNames(school.id, true, groupId);
          schoolsToEmail.push({
            ...school,
            partnerSchoolNames: partnerNames
          });
        }
      }
      
      if (schoolId) {
        const standaloneSchool = await prisma.school.findUnique({
          where: { id: schoolId },
          select: {
            id: true,
            schoolName: true,
            teacherName: true,
            teacherEmail: true,
            dashboardToken: true
          }
        });
        
        if (standaloneSchool) {
          const partnerNames = await getPartnerNames(standaloneSchool.id, false);
          schoolsToEmail.push({
            ...standaloneSchool,
            partnerSchoolNames: partnerNames
          });
        }
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
          dashboardToken: school.dashboardToken
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all schools with their matched school data and student counts
    const schools = await prisma.school.findMany({
      include: {
        students: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastInitial: true,
            grade: true,
            interests: true,
            otherInterests: true,
            profileCompleted: true,
            parentConsent: true,
            createdAt: true
          }
        },
        matchedWithSchool: {
          select: {
            id: true,
            schoolName: true,
            teacherName: true,
            region: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // TEMPORARY DEBUG - ADD THESE LINES HERE
    console.log('=== SCHOOLS QUERY DEBUG ===');
    console.log('Total schools found:', schools.length);
    console.log('Jonas school present:', schools.some(s => s.teacherEmail === 'jonas.rideout@gmail.com'));
    console.log('All emails:', schools.map(s => s.teacherEmail));

    // Transform schools with student counts and full student data
    const transformedSchools = schools.map(school => ({
      id: school.id,
      schoolName: school.schoolName,
      teacherName: school.teacherName,
      teacherEmail: school.teacherEmail,
      teacherPhone: school.teacherPhone,
      dashboardToken: school.dashboardToken,
      region: school.region,
      gradeLevel: school.gradeLevel,
      expectedClassSize: school.expectedClassSize,
      startMonth: school.startMonth,
      specialConsiderations: school.specialConsiderations,
      status: school.status,
      letterFrequency: school.letterFrequency,
      lettersSent: school.lettersSent,
      lettersReceived: school.lettersReceived,
      matchedWithSchoolId: school.matchedWithSchoolId,
      matchedSchool: school.matchedWithSchool,
      // Include full student data with profileCompleted field
      students: school.students,
      studentCounts: {
        expected: school.expectedClassSize,
        registered: school.students.length,
        ready: school.students.filter(s => s.profileCompleted).length
      }
    }));
    
    // Calculate status counts
    const statusCounts = transformedSchools.reduce((acc, school) => {
      acc[school.status] = (acc[school.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Ensure all statuses are represented
    const completeStatusCounts = {
      COLLECTING: statusCounts.COLLECTING || 0,
      READY: statusCounts.READY || 0,
      MATCHED: statusCounts.MATCHED || 0,
      CORRESPONDING: statusCounts.CORRESPONDING || 0,
      DONE: statusCounts.DONE || 0
    };
    
    return NextResponse.json({
      schools: transformedSchools,
      statusCounts: completeStatusCounts,
      totalSchools: transformedSchools.length
    });
  } catch (error) {
    console.error('Error fetching all schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools data' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// TEMPORARY DEBUG
console.log('=== ALL-SCHOOLS DEBUG ===');
const debugSchools = await prisma.school.findMany({
  select: { id: true, schoolName: true }
});
console.log('All-schools endpoint sees schools:');
debugSchools.forEach((school, index) => {
  console.log(`${index}: ID="${school.id}" NAME="${school.schoolName}"`);
});

export async function GET() {
  try {
    // Get all schools with their matched school data and student counts
    const schools = await prisma.school.findMany({
      include: {
        students: {
          where: { isActive: true },
          select: {
            id: true,
            profileCompleted: true
          }
        },
        matchedWithSchool: {
          select: {
            id: true,
            schoolName: true,
            teacherFirstName: true,
            teacherLastName: true,
            region: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transform schools with student counts
    const transformedSchools = schools.map(school => ({
      id: school.id,
      schoolName: school.schoolName,
      teacherFirstName: school.teacherFirstName,
      teacherLastName: school.teacherLastName,
      teacherEmail: school.teacherEmail,
      region: school.region,
      gradeLevel: school.gradeLevel,
      expectedClassSize: school.expectedClassSize,
      startMonth: school.startMonth,
      letterFrequency: school.letterFrequency,
      status: school.status,
      lettersSent: school.lettersSent,
      lettersReceived: school.lettersReceived,
      matchedWithSchoolId: school.matchedWithSchoolId,
      matchedSchool: school.matchedWithSchool,
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

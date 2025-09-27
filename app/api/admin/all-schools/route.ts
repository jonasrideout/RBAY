// /app/api/admin/all-schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('All-schools using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    console.log('All-schools starting query...');
    
    // Get all schools with their matched school data, students, and pen pal assignments
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
            createdAt: true,
            // Include pen pal connections to check assignment status
            penpalConnections: {
              select: {
                id: true,
                penpalId: true
              }
            },
            penpalOf: {
              select: {
                id: true,
                studentId: true
              }
            }
          }
        },
        matchedWithSchool: {
          select: {
            id: true,
            schoolName: true,
            teacherName: true,
            teacherEmail: true,
            schoolCity: true,
            schoolState: true,
            expectedClassSize: true,
            region: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log('All-schools found schools:', schools.length);
    
    // Calculate pen pal assignments for each school
    const transformedSchools = schools.map(school => {
      // Count students with pen pal assignments
      const studentsWithPenPals = school.students.filter(student => 
        student.penpalConnections.length > 0 || student.penpalOf.length > 0
      );
      
      // Calculate pen pal assignment status
      const totalStudents = school.students.length;
      const studentsWithAssignments = studentsWithPenPals.length;
      const hasPenPalAssignments = studentsWithAssignments > 0;
      const allStudentsAssigned = totalStudents > 0 && studentsWithAssignments === totalStudents;
      
      return {
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
        // Include full student data (without pen pal details for privacy)
        students: school.students.map(student => ({
          id: student.id,
          firstName: student.firstName,
          lastInitial: student.lastInitial,
          grade: student.grade,
          interests: student.interests,
          otherInterests: student.otherInterests,
          profileCompleted: student.profileCompleted,
          parentConsent: student.parentConsent,
          createdAt: student.createdAt
        })),
        studentCounts: {
          expected: school.expectedClassSize,
          registered: school.students.length,
          ready: school.students.filter(s => s.profileCompleted).length
        },
        // New pen pal assignment data
        penPalAssignments: {
          hasAssignments: hasPenPalAssignments,
          studentsWithPenPals: studentsWithAssignments,
          totalStudents: totalStudents,
          allStudentsAssigned: allStudentsAssigned,
          assignmentPercentage: totalStudents > 0 ? Math.round((studentsWithAssignments / totalStudents) * 100) : 0
        }
      };
    });
    
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
    
    console.log('All-schools returning data - schools:', transformedSchools.length);
    
    return NextResponse.json({
      schools: transformedSchools,
      statusCounts: completeStatusCounts,
      totalSchools: transformedSchools.length
    });
  } catch (error) {
    console.error('All-schools error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// /app/api/debug/database/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all schools with their matching information
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        schoolName: true,
        teacherEmail: true,
        status: true,
        matchedWithSchoolId: true,
        matchedWithSchool: {
          select: {
            schoolName: true,
            teacherEmail: true
          }
        },
        students: {
          select: {
            id: true,
            firstName: true,
            profileCompleted: true
          }
        }
      },
      orderBy: {
        schoolName: 'asc'
      }
    });

    // Get all school pairings
    const schoolPairings = await prisma.schoolPairing.findMany({
      include: {
        school1: {
          select: {
            schoolName: true,
            teacherEmail: true
          }
        },
        school2: {
          select: {
            schoolName: true,
            teacherEmail: true
          }
        }
      }
    });

    // Get all student pen pal connections
    const studentPairings = await prisma.studentPenpal.findMany({
      include: {
        student: {
          select: {
            firstName: true,
            school: {
              select: {
                schoolName: true
              }
            }
          }
        },
        penpal: {
          select: {
            firstName: true,
            school: {
              select: {
                schoolName: true
              }
            }
          }
        }
      }
    });

    // Count totals
    const totalSchools = schools.length;
    const matchedSchools = schools.filter(s => s.matchedWithSchoolId !== null).length;
    const readySchools = schools.filter(s => s.status === 'READY').length;

    return NextResponse.json({
      summary: {
        totalSchools,
        matchedSchools,
        readySchools,
        totalSchoolPairings: schoolPairings.length,
        totalStudentPairings: studentPairings.length
      },
      schools: schools.map(school => ({
        id: school.id,
        name: school.schoolName,
        teacher: school.teacherEmail,
        status: school.status,
        matchedWithId: school.matchedWithSchoolId,
        matchedWithName: school.matchedWithSchool?.schoolName || null,
        studentCount: school.students.length,
        readyStudents: school.students.filter(s => s.profileCompleted).length,
        isMatched: school.matchedWithSchoolId !== null
      })),
      schoolPairings: schoolPairings.map(pairing => ({
        id: pairing.id,
        school1: `${pairing.school1.schoolName} (${pairing.school1.teacherEmail})`,
        school2: `${pairing.school2.schoolName} (${pairing.school2.teacherEmail})`,
        createdAt: pairing.createdAt
      })),
      studentPairings: studentPairings.map(pairing => ({
        student: `${pairing.student.firstName} from ${pairing.student.school.schoolName}`,
        penpal: `${pairing.penpal.firstName} from ${pairing.penpal.school.schoolName}`
      })),
      potentialIssues: [
        ...(matchedSchools > 0 ? [`Found ${matchedSchools} schools with matchedWithSchoolId set`] : []),
        ...(schoolPairings.length > 0 ? [`Found ${schoolPairings.length} records in school_pairings table`] : []),
        ...(studentPairings.length > 0 ? [`Found ${studentPairings.length} student pen pal connections`] : [])
      ]
    });

  } catch (error) {
    console.error('Error examining database:', error);
    return NextResponse.json(
      { error: 'Failed to examine database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

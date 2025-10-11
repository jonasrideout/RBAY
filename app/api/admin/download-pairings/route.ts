// app/api/admin/download-pairings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define the pen pal type for TypeScript
interface PenpalData {
  name: string;
  grade: string;
  school: string | undefined;
  city: string | null | undefined;
  state: string | null | undefined;
  teacherName: string | undefined;
  interests: string[];
  otherInterests: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    
    if (!schoolId) {
      return NextResponse.json(
        { error: 'schoolId parameter is required' },
        { status: 400 }
      );
    }

    // Fetch school with students and their pen pal assignments
    // Also check if this school is part of a group
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        schoolGroup: true,
        students: {
          where: { isActive: true },
          include: {
            penpalConnections: {
              include: {
                penpal: {
                  include: {
                    school: true
                  }
                }
              }
            },
            penpalOf: {
              include: {
                student: {
                  include: {
                    school: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Handle multiple pen pals per student
    const studentsWithPenpals = school.students.map(student => {
      // Collect ALL pen pals (both directions of relationships)
      const allPenpals: PenpalData[] = [];
      
      // Add pen pals from penpalConnections (this student -> other students)
      student.penpalConnections.forEach(connection => {
        if (connection.penpal) {
          allPenpals.push({
            name: `${connection.penpal.firstName} ${connection.penpal.lastInitial}.`,
            grade: connection.penpal.grade,
            school: connection.penpal.school?.schoolName,
            city: connection.penpal.school?.schoolCity,
            state: connection.penpal.school?.schoolState,
            teacherName: connection.penpal.school?.teacherName,
            interests: connection.penpal.interests,
            otherInterests: connection.penpal.otherInterests
          });
        }
      });
      
      // Add pen pals from penpalOf (other students -> this student)
      student.penpalOf.forEach(connection => {
        if (connection.student) {
          allPenpals.push({
            name: `${connection.student.firstName} ${connection.student.lastInitial}.`,
            grade: connection.student.grade,
            school: connection.student.school?.schoolName,
            city: connection.student.school?.schoolCity,
            state: connection.student.school?.schoolState,
            teacherName: connection.student.school?.teacherName,
            interests: connection.student.interests,
            otherInterests: connection.student.otherInterests
          });
        }
      });

      // Remove duplicates (in case same relationship exists in both directions)
      const uniquePenpals = allPenpals.filter((penpal, index, self) =>
        index === self.findIndex(p => p.name === penpal.name)
      );

      return {
        student: {
          name: `${student.firstName} ${student.lastInitial}.`,
          grade: student.grade,
          interests: student.interests,
          otherInterests: student.otherInterests,
          penpalPreference: student.penpalPreference
        },
        penpals: uniquePenpals,
        penpalCount: uniquePenpals.length
      };
    });

    // Determine partner school name(s)
    let partnerSchoolName: string;
    
    if (school.schoolGroupId) {
      // School is part of a group
      // Get all OTHER schools in the same group (excluding this school)
      const groupSchools = await prisma.school.findMany({
        where: {
          schoolGroupId: school.schoolGroupId,
          id: { not: schoolId }
        },
        select: {
          schoolName: true
        }
      });
      
      // Build partner name from other schools in group + pen pal schools
      const groupPartnerNames = groupSchools.map(s => s.schoolName);
      
      // Get pen pal schools (schools from outside the group)
      const penpalSchoolName = studentsWithPenpals
        .find(student => student.penpals.length > 0)
        ?.penpals[0]?.school;
      
      if (penpalSchoolName && !groupPartnerNames.includes(penpalSchoolName)) {
        // Partner is outside the group
        partnerSchoolName = penpalSchoolName;
      } else if (groupPartnerNames.length > 0) {
        // Partner is other schools in the group
        partnerSchoolName = groupPartnerNames.join(' + ');
      } else {
        partnerSchoolName = 'Partner School';
      }
    } else {
      // School is NOT part of a group - use original logic
      partnerSchoolName = studentsWithPenpals
        .find(student => student.penpals.length > 0)
        ?.penpals[0]?.school || 'Partner School';
    }

    return NextResponse.json({
      school: {
        name: school.schoolName,
        teacher: school.teacherName,
        email: school.teacherEmail,
        partnerSchool: partnerSchoolName
      },
      pairings: studentsWithPenpals,
      summary: {
        totalStudents: studentsWithPenpals.length,
        studentsWithPenpals: studentsWithPenpals.filter(s => s.penpalCount > 0).length,
        studentsWithoutPenpals: studentsWithPenpals.filter(s => s.penpalCount === 0).length,
        totalPenpalConnections: studentsWithPenpals.reduce((sum, s) => sum + s.penpalCount, 0),
        averagePenpalsPerStudent: studentsWithPenpals.length > 0 
          ? (studentsWithPenpals.reduce((sum, s) => sum + s.penpalCount, 0) / studentsWithPenpals.length).toFixed(1)
          : '0'
      },
      generatedAt: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${school.schoolName}_pen_pal_assignments.json"`
      }
    });

  } catch (error) {
    console.error('Error generating pairings download:', error);
    return NextResponse.json(
      { error: 'Failed to generate pairings download' },
      { status: 500 }
    );
  }
}

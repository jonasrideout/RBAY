import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define the pen pal type for TypeScript
interface PenpalData {
  name: string;
  grade: string;
  school: string | undefined;
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
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
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
            name: `${connection.penpal.firstName} ${connection.penpal.lastName}`,
            grade: connection.penpal.grade,
            school: connection.penpal.school?.schoolName,
            interests: connection.penpal.interests,
            otherInterests: connection.penpal.otherInterests
          });
        }
      });
      
      // Add pen pals from penpalOf (other students -> this student)
      student.penpalOf.forEach(connection => {
        if (connection.student) {
          allPenpals.push({
            name: `${connection.student.firstName} ${connection.student.lastName}`,
            grade: connection.student.grade,
            school: connection.student.school?.schoolName,
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
          name: `${student.firstName} ${student.lastName}`,
          grade: student.grade,
          interests: student.interests,
          otherInterests: student.otherInterests,
          penpalPreference: student.penpalPreference
        },
        penpals: uniquePenpals,
        penpalCount: uniquePenpals.length
      };
    });

    // Get partner school name from the pen pal data for the header
    const partnerSchoolName = studentsWithPenpals
      .find(student => student.penpals.length > 0)
      ?.penpals[0]?.school;

    return NextResponse.json({
      school: {
        name: school.schoolName,
        teacher: school.teacherName,  // Fixed: use single teacherName field
        email: school.teacherEmail,
        partnerSchool: partnerSchoolName || 'Partner School'
      },
      pairings: studentsWithPenpals,
      summary: {
        totalStudents: studentsWithPenpals.length,
        studentsWithPenpals: studentsWithPenpals.filter(s => s.penpalCount > 0).length,
        studentsWithoutPenpals: studentsWithPenpals.filter(s => s.penpalCount === 0).length,
        totalPenpalConnections: studentsWithPenpals.reduce((sum, s) => sum + s.penpalCount, 0),
        averagePenpalsPerStudent: studentsWithPenpals.length > 0 
          ? (studentsWithPenpals.reduce((sum, s) => sum + s.penpalCount, 0) / studentsWithPenpals.length).toFixed(1)
          : 0
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

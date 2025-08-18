// app/api/admin/download-pairings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define the pen pal type for TypeScript
interface PenpalData {
  name: string;
  grade: string;
  school: string | undefined;
  interests: string[];
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
            sentPenpals: {
              include: {
                student2: {
                  include: {
                    school: true
                  }
                }
              }
            },
            receivedPenpals: {
              include: {
                student1: {
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

    // UPDATED: Handle multiple pen pals per student
    const studentsWithPenpals = school.students.map(student => {
      // Collect ALL pen pals (both sent and received relationships)
      const allPenpals: PenpalData[] = []; // ✅ FIXED: Added explicit typing
      
      // Add pen pals from sent relationships (this student -> other students)
      student.sentPenpals.forEach(sentPenpal => {
        if (sentPenpal.student2) {
          allPenpals.push({
            name: `${sentPenpal.student2.firstName} ${sentPenpal.student2.lastName}`,
            grade: sentPenpal.student2.grade,
            school: sentPenpal.student2.school?.schoolName,
            interests: sentPenpal.student2.interests
          });
        }
      });
      
      // Add pen pals from received relationships (other students -> this student)
      student.receivedPenpals.forEach(receivedPenpal => {
        if (receivedPenpal.student1) {
          allPenpals.push({
            name: `${receivedPenpal.student1.firstName} ${receivedPenpal.student1.lastName}`,
            grade: receivedPenpal.student1.grade,
            school: receivedPenpal.student1.school?.schoolName,
            interests: receivedPenpal.student1.interests
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
          penpalPreference: student.penpalPreference // Include preference for reference
        },
        penpals: uniquePenpals, // CHANGED: Array of pen pals instead of single penpal
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
        teacher: `${school.teacherFirstName} ${school.teacherLastName}`,
        email: school.teacherEmail,
        partnerSchool: partnerSchoolName || 'Partner School' // For header display
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

// app/api/admin/download-pairings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // TODO: Generate actual PDF here
    // For now, return placeholder response
    const studentsWithPenpals = school.students.map(student => {
      // Find pen pal (could be in either sent or received penpals)
      const sentPenpal = student.sentPenpals[0];
      const receivedPenpal = student.receivedPenpals[0];
      const penpal = sentPenpal?.student2 || receivedPenpal?.student1;

      return {
        student: {
          name: `${student.firstName} ${student.lastName}`,
          grade: student.grade,
          interests: student.interests
        },
        penpal: penpal ? {
          name: `${penpal.firstName} ${penpal.lastName}`,
          grade: penpal.grade,
          school: penpal.school?.schoolName,
          interests: penpal.interests
        } : null
      };
    });

    // Return JSON for now (will be PDF later)
    return NextResponse.json({
      school: {
        name: school.schoolName,
        teacher: `${school.teacherFirstName} ${school.teacherLastName}`,
        email: school.teacherEmail
      },
      pairings: studentsWithPenpals,
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

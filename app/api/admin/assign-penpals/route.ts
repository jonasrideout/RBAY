// app/api/admin/assign-penpals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { matchStudents, generateMatchingSummary } from '@/app/lib/student-matching';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { school1Id, school2Id } = await request.json();

    if (!school1Id || !school2Id) {
      return NextResponse.json(
        { error: 'Both school1Id and school2Id are required' },
        { status: 400 }
      );
    }

    // Fetch schools with their students
    const [school1, school2] = await Promise.all([
      prisma.school.findUnique({
        where: { id: school1Id },
        include: { 
          students: { 
            where: { 
              isActive: true,
              profileCompleted: true 
            }
          } 
        }
      }),
      prisma.school.findUnique({
        where: { id: school2Id },
        include: { 
          students: { 
            where: { 
              isActive: true,
              profileCompleted: true 
            }
          } 
        }
      })
    ]);

    if (!school1 || !school2) {
      return NextResponse.json(
        { error: 'One or both schools not found' },
        { status: 404 }
      );
    }

    // Verify schools are matched
    if (school1.status !== 'MATCHED' || school2.status !== 'MATCHED') {
      return NextResponse.json(
        { error: 'Schools must be in MATCHED status to assign pen pals' },
        { status: 400 }
      );
    }

    // Get students ready for matching
    const school1Students = school1.students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
      interests: student.interests,
      schoolId: student.schoolId
    }));

    const school2Students = school2.students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
      interests: student.interests,
      schoolId: student.schoolId
    }));

    if (school1Students.length === 0 || school2Students.length === 0) {
      return NextResponse.json(
        { error: 'Both schools must have students with completed profiles' },
        { status: 400 }
      );
    }

    // Generate student matches using the matching algorithm
    const matches = matchStudents(school1Students, school2Students);
    const summary = generateMatchingSummary(matches, school1Students, school2Students);

    // Create StudentPenpal records in database
    const penpalRecords = await Promise.all(
      matches.map(match => 
        prisma.studentPenpal.create({
          data: {
            student1Id: match.student1Id,
            student2Id: match.student2Id,
            status: 'active'
          }
        })
      )
    );

    // TODO: After pen pals are assigned, schools could transition to CORRESPONDING status
    // For now, we'll leave them in MATCHED status

    return NextResponse.json({
      success: true,
      message: 'Pen pals assigned successfully',
      data: {
        totalMatches: matches.length,
        matches: matches,
        summary: summary,
        penpalRecords: penpalRecords.length
      }
    });

  } catch (error) {
    console.error('Error assigning pen pals:', error);
    return NextResponse.json(
      { error: 'Failed to assign pen pals' },
      { status: 500 }
    );
  }
}

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

    // DEBUG: Log what we're looking for
    console.log('=== DEBUG assign-penpals ===');
    console.log('Received payload:', { school1Id, school2Id });
    console.log('school1Id type:', typeof school1Id);
    console.log('school2Id type:', typeof school2Id);

    // DEBUG: Check if schools exist at all
    const allSchools = await prisma.school.findMany({
      select: { id: true, schoolName: true, status: true }
    });
    console.log('All schools in database:', allSchools);

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

    console.log('Found school1:', school1 ? school1.schoolName : 'NOT FOUND');
    console.log('Found school2:', school2 ? school2.schoolName : 'NOT FOUND');

    if (!school1 || !school2) {
      console.log('ERROR: School lookup failed');
      return NextResponse.json(
        { error: 'One or both schools not found' },
        { status: 404 }
      );
    }

    // UPDATED: Accept schools in READY status and update them to MATCHED
    if (school1.status !== 'READY' && school1.status !== 'MATCHED') {
      return NextResponse.json(
        { error: `School ${school1.schoolName} must be in READY status to be matched` },
        { status: 400 }
      );
    }

    if (school2.status !== 'READY' && school2.status !== 'MATCHED') {
      return NextResponse.json(
        { error: `School ${school2.schoolName} must be in READY status to be matched` },
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

    // ADDED: Update both schools to MATCHED status and set their matchedWithSchoolId
    await Promise.all([
      prisma.school.update({
        where: { id: school1Id },
        data: { 
          status: 'MATCHED',
          matchedWithSchoolId: school2Id
        }
      }),
      prisma.school.update({
        where: { id: school2Id },
        data: { 
          status: 'MATCHED',
          matchedWithSchoolId: school1Id
        }
      })
    ]);

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

    // Return success with updated school info
    return NextResponse.json({
      success: true,
      message: 'Schools matched and pen pals assigned successfully',
      data: {
        totalMatches: matches.length,
        matches: matches,
        summary: summary,
        penpalRecords: penpalRecords.length,
        school1: {
          id: school1Id,
          name: school1.schoolName,
          status: 'MATCHED',
          matchedWithSchoolId: school2Id
        },
        school2: {
          id: school2Id,
          name: school2.schoolName,
          status: 'MATCHED',
          matchedWithSchoolId: school1Id
        }
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

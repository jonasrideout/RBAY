// app/api/admin/assign-penpals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchStudents, generateMatchingSummary } from '@/app/lib/student-matching';

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
    console.log('=== ENHANCED DEBUG assign-penpals ===');
    console.log('Received payload:', { school1Id, school2Id });
    console.log('school1Id type:', typeof school1Id, 'length:', school1Id.length);
    console.log('school2Id type:', typeof school2Id, 'length:', school2Id.length);
    
    // Character-by-character analysis
    console.log('school1Id chars:', school1Id.split('').map((c: string, i: number) => `${i}:${c}`));
    console.log('school2Id chars:', school2Id.split('').map((c: string, i: number) => `${i}:${c}`));

    // DEBUG: Check if schools exist at all
    const allSchools = await prisma.school.findMany({
      select: { id: true, schoolName: true, status: true }
    });
    console.log('=== ALL SCHOOLS IN DATABASE ===');
    allSchools.forEach((school, index) => {
      console.log(`${index}: ID="${school.id}" NAME="${school.schoolName}" STATUS="${school.status}"`);
      console.log(`   ID length: ${school.id.length}, chars: ${school.id.split('').slice(0, 10).join('')}...`);
    });
    console.log('Total schools found:', allSchools.length);

    // DEBUG: Check exact ID matches
    const school1Exists = allSchools.find(s => s.id === school1Id);
    const school2Exists = allSchools.find(s => s.id === school2Id);
    console.log('school1Id exact match:', school1Exists ? 'FOUND' : 'NOT FOUND');
    console.log('school2Id exact match:', school2Exists ? 'FOUND' : 'NOT FOUND');

    if (school1Exists) console.log('school1 details:', school1Exists);
    if (school2Exists) console.log('school2 details:', school2Exists);

    // DEBUG: String comparison analysis
    if (!school1Exists) {
      console.log('=== SCHOOL1 ID COMPARISON ===');
      allSchools.forEach(school => {
        const match = school.id === school1Id;
        const startsSame = school.id.substring(0, 5) === school1Id.substring(0, 5);
        console.log(`DB: "${school.id}" vs SENT: "${school1Id}" - Match: ${match}, StartsSame: ${startsSame}`);
      });
    }

    if (!school2Exists) {
      console.log('=== SCHOOL2 ID COMPARISON ===');
      allSchools.forEach(school => {
        const match = school.id === school2Id;
        const startsSame = school.id.substring(0, 5) === school2Id.substring(0, 5);
        console.log(`DB: "${school.id}" vs SENT: "${school2Id}" - Match: ${match}, StartsSame: ${startsSame}`);
      });
    }

    // DEBUG: Try direct prisma queries
    console.log('=== ATTEMPTING INDIVIDUAL PRISMA QUERIES ===');
    const directSchool1 = await prisma.school.findUnique({ where: { id: school1Id } });
    const directSchool2 = await prisma.school.findUnique({ where: { id: school2Id } });
    console.log('Direct query school1:', directSchool1 ? 'FOUND' : 'NOT FOUND');
    console.log('Direct query school2:', directSchool2 ? 'FOUND' : 'NOT FOUND');

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

    console.log('Found school1 with students:', school1 ? school1.schoolName : 'NOT FOUND');
    console.log('Found school2 with students:', school2 ? school2.schoolName : 'NOT FOUND');

    if (!school1 || !school2) {
      console.log('=== ERROR: School lookup failed ===');
      console.log('school1 result:', school1);
      console.log('school2 result:', school2);
      
      // Additional debugging: Check prisma client status
      console.log('Prisma client status check...');
      const testQuery = await prisma.school.count();
      console.log('Total schools via count():', testQuery);
      
      return NextResponse.json(
        { 
          error: 'One or both schools not found',
          debug: {
            school1Id,
            school2Id,
            school1Found: !!school1,
            school2Found: !!school2,
            totalSchoolsInDb: allSchools.length
          }
        },
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

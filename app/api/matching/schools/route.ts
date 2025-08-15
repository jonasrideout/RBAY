import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get schools that are ready for matching
    const schools = await prisma.school.findMany({
      where: {
        status: 'READY'
      },
      include: {
        students: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            interests: true,
            profileCompleted: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transform the data for the admin interface
    const transformedSchools = schools.map(school => ({
      id: school.id,
      schoolName: school.schoolName,
      teacherFirstName: school.teacherFirstName,
      teacherLastName: school.teacherLastName,
      teacherEmail: school.teacherEmail,
      region: school.region || 'Unknown',
      gradeLevel: school.gradeLevel,
      expectedClassSize: school.expectedClassSize,
      startMonth: school.startMonth,
      letterFrequency: school.letterFrequency,
      students: school.students,
      studentCounts: {
        expected: school.expectedClassSize,
        registered: school.students.length,
        ready: school.students.filter(s => s.profileCompleted).length
      }
    }));

    return NextResponse.json({
      schools: transformedSchools,
      totalCount: transformedSchools.length
    });

  } catch (error) {
    console.error('Error fetching schools for matching:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools for matching' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'generateMatches') {
      // Get all schools ready for matching
      const readySchools = await prisma.school.findMany({
        where: {
          status: 'READY'
        },
        include: {
          students: {
            where: { 
              isActive: true,
              profileCompleted: true
            }
          }
        }
      });

      if (readySchools.length < 2) {
        return NextResponse.json({
          matches: [],
          message: 'Need at least 2 schools ready for matching'
        });
      }

      // Simple matching algorithm - pair schools from different regions
      const matches = [];
      const usedSchools = new Set();

      for (let i = 0; i < readySchools.length; i++) {
        if (usedSchools.has(readySchools[i].id)) continue;

        const school1 = readySchools[i];
        
        // Find a compatible school from a different region
        for (let j = i + 1; j < readySchools.length; j++) {
          if (usedSchools.has(readySchools[j].id)) continue;

          const school2 = readySchools[j];
          
          // Check if schools are from different regions
          if (school1.region !== school2.region) {
            // Calculate compatibility score
            const gradeOverlap = school1.gradeLevel.some(grade => 
              school2.gradeLevel.includes(grade)
            );
            
            const sizeDifference = Math.abs(school1.students.length - school2.students.length);
            const sizeCompatibility = sizeDifference <= 10; // Within 10 students
            
            const startMonthMatch = school1.startMonth === school2.startMonth;
            
            // Calculate score (0-100)
            let score = 0;
            if (gradeOverlap) score += 40;
            if (sizeCompatibility) score += 30;
            if (startMonthMatch) score += 30;

            matches.push({
              id: `${school1.id}-${school2.id}`,
              school1: {
                id: school1.id,
                name: school1.schoolName,
                teacher: `${school1.teacherFirstName} ${school1.teacherLastName}`,
                region: school1.region,
                grades: school1.gradeLevel,
                studentCount: school1.students.length,
                startMonth: school1.startMonth
              },
              school2: {
                id: school2.id,
                name: school2.schoolName,
                teacher: `${school2.teacherFirstName} ${school2.teacherLastName}`,
                region: school2.region,
                grades: school2.gradeLevel,
                studentCount: school2.students.length,
                startMonth: school2.startMonth
              },
              score,
              compatibility: {
                gradeOverlap,
                sizeCompatibility,
                startMonthMatch,
                differentRegions: true
              }
            });

            usedSchools.add(school1.id);
            usedSchools.add(school2.id);
            break;
          }
        }
      }

      // Sort matches by score (highest first)
      matches.sort((a, b) => b.score - a.score);

      return NextResponse.json({
        matches,
        algorithm: 'cross-regional-compatibility',
        totalReadySchools: readySchools.length,
        matchedSchools: usedSchools.size,
        unmatchedSchools: readySchools.length - usedSchools.size
      });
    }

    if (action === 'approveMatch') {
      const { school1Id, school2Id } = body;

      if (!school1Id || !school2Id) {
        return NextResponse.json(
          { error: 'Both school IDs are required' },
          { status: 400 }
        );
      }

      // Update both schools to matched status and link them
      await prisma.school.update({
        where: { id: school1Id },
        data: { 
          status: 'MATCHED',
          matchedWithSchoolId: school2Id
        }
      });

      await prisma.school.update({
        where: { id: school2Id },
        data: { 
          status: 'MATCHED',
          matchedWithSchoolId: school1Id
        }
      });

      return NextResponse.json({
        message: 'Schools successfully matched',
        matchedSchools: [school1Id, school2Id]
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in matching operation:', error);
    return NextResponse.json(
      { error: 'Failed to process matching request' },
      { status: 500 }
    );
  }
}

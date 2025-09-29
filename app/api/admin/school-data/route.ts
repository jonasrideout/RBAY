import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get schoolId from query parameters
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Fetch school data with students
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        students: true,
        matchedWithSchool: {
          select: {
            schoolName: true
          }
        }
      }
    });RetryClaude can make mistakes. Please double-check responses.

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the dashboard expected format
    // Using exact schema field names from prisma/schema.prisma
    const dashboardData = {
      id: school.id,
      name: school.schoolName,
      teacherName: school.teacherName,
      teacherEmail: school.teacherEmail,
      location: `${school.schoolCity || ''}, ${school.schoolState}`.trim().replace(/^,\s*/, ''),
      status: school.status,
      expectedClassSize: school.expectedClassSize,
      startMonth: school.startMonth,
      dashboardToken: school.dashboardToken,
      matchedWithSchoolId: school.matchedWithSchoolId,
      matchedSchoolName: school.matchedWithSchool?.schoolName,
      students: school.students.map(student => ({
        id: student.id,
        firstName: student.firstName,
        lastInitial: student.lastInitial,
        grade: student.grade,
        interests: student.interests || [],
        otherInterests: student.otherInterests || '',
        hasInterests: (student.interests && student.interests.length > 0) || 
                     (student.otherInterests && student.otherInterests.trim() !== ''),
        status: (student.interests && student.interests.length > 0) || 
                (student.otherInterests && student.otherInterests.trim() !== '') 
                ? 'ready' : 'needs-info'
      }))
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error fetching school data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school data' },
      { status: 500 }
    );
  }
}

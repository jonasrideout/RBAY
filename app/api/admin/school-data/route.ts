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
        students: true
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the dashboard expected format
    const dashboardData = {
      id: school.id,
      name: school.name,
      teacherName: school.teacherName,
      teacherEmail: school.teacherEmail,
      location: school.location,
      status: school.status,
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

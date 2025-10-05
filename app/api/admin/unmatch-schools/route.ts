import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { schoolId, groupId } = await request.json();
    
    // Must provide either schoolId or groupId
    if (!schoolId && !groupId) {
      return NextResponse.json(
        { error: 'Either School ID or Group ID is required' },
        { status: 400 }
      );
    }

    if (groupId) {
      // Unmatching a group
      return await unmatchGroup(groupId);
    } else {
      // Unmatching a school
      return await unmatchSchool(schoolId);
    }

  } catch (error) {
    console.error('Error unmatching:', error);
    return NextResponse.json(
      { error: 'Failed to unmatch' },
      { status: 500 }
    );
  }
}

async function unmatchSchool(schoolId: string) {
  // Get the school
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      students: {
        include: {
          penpalConnections: true
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

  // Check if any students have pen pal assignments
  const hasPenpalAssignments = school.students.some(
    student => student.penpalConnections.length > 0
  );

  if (hasPenpalAssignments) {
    return NextResponse.json(
      { error: 'Cannot unmatch after pen pals have been assigned' },
      { status: 400 }
    );
  }

  if (!school.matchedWithSchoolId) {
    return NextResponse.json(
      { error: 'School is not currently matched' },
      { status: 400 }
    );
  }

  const matchedWithSchoolId = school.matchedWithSchoolId;

  // Check if matched with a group (marker format)
  if (matchedWithSchoolId.startsWith('group:')) {
    const groupId = matchedWithSchoolId.replace('group:', '');
    
    // Clear the match for the group only (school's matchedWithSchoolId should already be null)
    await prisma.schoolGroup.update({
      where: { id: groupId },
      data: { matchedWithGroupId: null }
    });
  } else {
    // Matched with another school
    await prisma.$transaction([
      prisma.school.update({
        where: { id: schoolId },
        data: { matchedWithSchoolId: null }
      }),
      prisma.school.update({
        where: { id: matchedWithSchoolId },
        data: { matchedWithSchoolId: null }
      })
    ]);
  }

  const response = NextResponse.json({ 
    success: true,
    message: 'Unmatched successfully'
  });
  
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  return response;
}

async function unmatchGroup(groupId: string) {
  // Get the group with all schools
  const group = await prisma.schoolGroup.findUnique({
    where: { id: groupId },
    include: {
      schools: {
        include: {
          students: {
            include: {
              penpalConnections: true
            }
          }
        }
      }
    }
  });

  if (!group) {
    return NextResponse.json(
      { error: 'Group not found' },
      { status: 404 }
    );
  }

  // Check if any students in any school in the group have pen pal assignments
  const hasPenpalAssignments = group.schools.some(school =>
    school.students.some(student => student.penpalConnections.length > 0)
  );

  if (hasPenpalAssignments) {
    return NextResponse.json(
      { error: 'Cannot unmatch after pen pals have been assigned' },
      { status: 400 }
    );
  }

  if (!group.matchedWithGroupId) {
    return NextResponse.json(
      { error: 'Group is not currently matched' },
      { status: 400 }
    );
  }

  const matchedWithGroupId = group.matchedWithGroupId;

  // Check if matched with a school (marker format)
  if (matchedWithGroupId.startsWith('school:')) {
    // Clear the match for the group only (school's matchedWithSchoolId should be null)
    await prisma.schoolGroup.update({
      where: { id: groupId },
      data: { matchedWithGroupId: null }
    });
  } else {
    // Matched with another group
    await prisma.$transaction([
      prisma.schoolGroup.update({
        where: { id: groupId },
        data: { matchedWithGroupId: null }
      }),
      prisma.schoolGroup.update({
        where: { id: matchedWithGroupId },
        data: { matchedWithGroupId: null }
      })
    ]);
  }

  const response = NextResponse.json({ 
    success: true,
    message: 'Unmatched successfully'
  });
  
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  return response;
}

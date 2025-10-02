import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to check if a school has pen pal assignments
async function schoolHasPenPals(schoolId: string): Promise<boolean> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      students: {
        where: { isActive: true },
        include: {
          penpalConnections: true,
          penpalOf: true
        }
      }
    }
  });

  if (!school) return false;

  return school.students.some(student => 
    student.penpalConnections.length > 0 || student.penpalOf.length > 0
  );
}

// Create a new school group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, schoolIds } = body;

    if (!name || !schoolIds || schoolIds.length < 2) {
      return NextResponse.json(
        { error: 'Group name and at least 2 school IDs required' },
        { status: 400 }
      );
    }

    // Verify all schools exist and aren't already in a group
    const schools = await prisma.school.findMany({
      where: { id: { in: schoolIds } }
    });

    if (schools.length !== schoolIds.length) {
      return NextResponse.json(
        { error: 'One or more schools not found' },
        { status: 404 }
      );
    }

    const alreadyGrouped = schools.filter(s => s.schoolGroupId);
    if (alreadyGrouped.length > 0) {
      return NextResponse.json(
        { 
          error: `${alreadyGrouped[0].schoolName} is already in a group` 
        },
        { status: 400 }
      );
    }

    // Check if any schools have pen pal assignments
    const schoolsWithPenPals = [];
    for (const school of schools) {
      const hasPenPals = await schoolHasPenPals(school.id);
      if (hasPenPals) {
        schoolsWithPenPals.push(school.schoolName);
      }
    }

    if (schoolsWithPenPals.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot group schools with pen pal assignments: ${schoolsWithPenPals.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Create the group
    const group = await prisma.schoolGroup.create({
      data: {
        name,
        schools: {
          connect: schoolIds.map((id: string) => ({ id }))
        }
      },
      include: {
        schools: {
          include: {
            students: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    const response = NextResponse.json({ group });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;

  } catch (error) {
    console.error('Error creating school group:', error);
    return NextResponse.json(
      { error: 'Failed to create school group' },
      { status: 500 }
    );
  }
}

// Get all school groups with pen pal status
export async function GET(request: NextRequest) {
  try {
    const groups = await prisma.schoolGroup.findMany({
      include: {
        schools: {
          include: {
            students: {
              where: { isActive: true },
              include: {
                penpalConnections: true,
                penpalOf: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add pen pal status to each school
    const groupsWithStatus = groups.map(group => ({
      ...group,
      schools: group.schools.map(school => {
        const hasPenPals = school.students.some(student => 
          student.penpalConnections.length > 0 || student.penpalOf.length > 0
        );
        return {
          ...school,
          hasPenPals
        };
      })
    }));

    const response = NextResponse.json({ groups: groupsWithStatus });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;

  } catch (error) {
    console.error('Error fetching school groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school groups' },
      { status: 500 }
    );
  }
}

// Update a school group (add/remove schools)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, schoolIdsToAdd, schoolIdsToRemove } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID required' },
        { status: 400 }
      );
    }

    // Get current group
    const group = await prisma.schoolGroup.findUnique({
      where: { id: groupId },
      include: {
        schools: true
      }
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check pen pal locks for schools being removed
    if (schoolIdsToRemove && schoolIdsToRemove.length > 0) {
      const lockedSchools = [];
      for (const schoolId of schoolIdsToRemove) {
        const hasPenPals = await schoolHasPenPals(schoolId);
        if (hasPenPals) {
          const school = group.schools.find(s => s.id === schoolId);
          if (school) {
            lockedSchools.push(school.schoolName);
          }
        }
      }

      if (lockedSchools.length > 0) {
        return NextResponse.json(
          { 
            error: `Cannot remove schools with pen pal assignments: ${lockedSchools.join(', ')}` 
          },
          { status: 400 }
        );
      }
    }

    // Check pen pal locks for schools being added
    if (schoolIdsToAdd && schoolIdsToAdd.length > 0) {
      const schoolsToAdd = await prisma.school.findMany({
        where: { id: { in: schoolIdsToAdd } }
      });

      const lockedSchools = [];
      for (const school of schoolsToAdd) {
        const hasPenPals = await schoolHasPenPals(school.id);
        if (hasPenPals) {
          lockedSchools.push(school.schoolName);
        }
      }

      if (lockedSchools.length > 0) {
        return NextResponse.json(
          { 
            error: `Cannot add schools with pen pal assignments: ${lockedSchools.join(', ')}` 
          },
          { status: 400 }
        );
      }

      // Check if any schools are already in another group
      const alreadyGrouped = schoolsToAdd.filter(s => s.schoolGroupId);
      if (alreadyGrouped.length > 0) {
        return NextResponse.json(
          { 
            error: `${alreadyGrouped[0].schoolName} is already in a group` 
          },
          { status: 400 }
        );
      }
    }

    // Calculate resulting school count
    const currentSchoolIds = group.schools.map(s => s.id);
    const removedIds = new Set(schoolIdsToRemove || []);
    const remainingIds = currentSchoolIds.filter(id => !removedIds.has(id));
    const addedIds = schoolIdsToAdd || [];
    const finalCount = remainingIds.length + addedIds.length;

    // If only 1 school would remain, auto-dissolve the group
    if (finalCount === 1) {
      // Disconnect all schools
      await prisma.school.updateMany({
        where: { schoolGroupId: groupId },
        data: { schoolGroupId: null }
      });

      // Delete the group
      await prisma.schoolGroup.delete({
        where: { id: groupId }
      });

      const response = NextResponse.json({ 
        success: true,
        dissolved: true,
        message: 'Group dissolved (only 1 school would remain)' 
      });
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return response;
    }

    // Ensure at least 2 schools remain
    if (finalCount < 2) {
      return NextResponse.json(
        { error: 'Group must have at least 2 schools' },
        { status: 400 }
      );
    }

    // Perform the updates
    if (schoolIdsToRemove && schoolIdsToRemove.length > 0) {
      await prisma.school.updateMany({
        where: { id: { in: schoolIdsToRemove } },
        data: { schoolGroupId: null }
      });
    }

    if (schoolIdsToAdd && schoolIdsToAdd.length > 0) {
      await prisma.school.updateMany({
        where: { id: { in: schoolIdsToAdd } },
        data: { schoolGroupId: groupId }
      });
    }

    // Fetch updated group
    const updatedGroup = await prisma.schoolGroup.findUnique({
      where: { id: groupId },
      include: {
        schools: {
          include: {
            students: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    const response = NextResponse.json({ success: true, group: updatedGroup });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;

  } catch (error) {
    console.error('Error updating school group:', error);
    return NextResponse.json(
      { error: 'Failed to update school group' },
      { status: 500 }
    );
  }
}

// Delete a school group (removes group but keeps schools)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID required' },
        { status: 400 }
      );
    }

    // Get group with schools
    const group = await prisma.schoolGroup.findUnique({
      where: { id: groupId },
      include: {
        schools: true
      }
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if any schools in the group have pen pals
    const lockedSchools = [];
    for (const school of group.schools) {
      const hasPenPals = await schoolHasPenPals(school.id);
      if (hasPenPals) {
        lockedSchools.push(school.schoolName);
      }
    }

    if (lockedSchools.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete group: these schools have pen pal assignments: ${lockedSchools.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Disconnect all schools from the group first
    await prisma.school.updateMany({
      where: { schoolGroupId: groupId },
      data: { schoolGroupId: null }
    });

    // Delete the group
    await prisma.schoolGroup.delete({
      where: { id: groupId }
    });

    const response = NextResponse.json({ success: true });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;

  } catch (error) {
    console.error('Error deleting school group:', error);
    return NextResponse.json(
      { error: 'Failed to delete school group' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

// Get all school groups
export async function GET(request: NextRequest) {
  try {
    const groups = await prisma.schoolGroup.findMany({
      include: {
        schools: {
          include: {
            students: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const response = NextResponse.json({ groups });
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

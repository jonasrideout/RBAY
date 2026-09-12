// /app/api/admin/mark-done/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Marks every School row on both sides of a completed, matched pair as
// DONE. Mirrors the school1Id/school2Id/group1Id/group2Id shape used by
// /api/admin/assign-penpals and /api/admin/match-schools, so a "pair" can be
// two individual schools, two groups, or one of each - groups are expanded
// to their member schools server-side before updating.
export async function POST(request: NextRequest) {
  try {
    const { school1Id, school2Id, group1Id, group2Id } = await request.json();

    const hasSchool1 = !!school1Id;
    const hasSchool2 = !!school2Id;
    const hasGroup1 = !!group1Id;
    const hasGroup2 = !!group2Id;

    const unitCount = [hasSchool1, hasSchool2, hasGroup1, hasGroup2].filter(Boolean).length;
    if (unitCount !== 2) {
      return NextResponse.json(
        { error: 'Must provide exactly two units to mark done (2 schools, 2 groups, or 1 school + 1 group)' },
        { status: 400 }
      );
    }

    const schoolIds: string[] = [];

    if (hasSchool1) schoolIds.push(school1Id);
    if (hasSchool2) schoolIds.push(school2Id);

    for (const groupId of [group1Id, group2Id].filter(Boolean)) {
      const group = await prisma.schoolGroup.findUnique({
        where: { id: groupId },
        select: { schools: { select: { id: true } } }
      });

      if (!group) {
        return NextResponse.json(
          { error: `Group ${groupId} not found` },
          { status: 404 }
        );
      }

      schoolIds.push(...group.schools.map(s => s.id));
    }

    if (schoolIds.length === 0) {
      return NextResponse.json(
        { error: 'No schools resolved from the given units' },
        { status: 400 }
      );
    }

    await prisma.school.updateMany({
      where: { id: { in: schoolIds } },
      data: { status: 'DONE' }
    });

    return NextResponse.json({
      success: true,
      updatedSchoolIds: schoolIds
    });

  } catch (error) {
    console.error('Error marking pair as done:', error);
    return NextResponse.json(
      { error: 'Failed to mark pair as done' },
      { status: 500 }
    );
  }
}

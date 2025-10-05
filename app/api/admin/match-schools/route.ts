import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { school1Id, school2Id, group1Id, group2Id } = await request.json();
    
    // Validate that we have either school IDs or group IDs (not mixed)
    const hasSchool1 = !!school1Id;
    const hasSchool2 = !!school2Id;
    const hasGroup1 = !!group1Id;
    const hasGroup2 = !!group2Id;
    
    // Must provide exactly 2 units to match
    const unitCount = [hasSchool1, hasSchool2, hasGroup1, hasGroup2].filter(Boolean).length;
    if (unitCount !== 2) {
      return NextResponse.json(
        { error: 'Must provide exactly two units to match (2 schools, 2 groups, or 1 school + 1 group)' },
        { status: 400 }
      );
    }
    
    // Cannot match school with itself or group with itself
    if (hasSchool1 && hasSchool2 && school1Id === school2Id) {
      return NextResponse.json(
        { error: 'Cannot match a school with itself' },
        { status: 400 }
      );
    }
    if (hasGroup1 && hasGroup2 && group1Id === group2Id) {
      return NextResponse.json(
        { error: 'Cannot match a group with itself' },
        { status: 400 }
      );
    }
    
    // Determine match type and execute appropriate logic
    if (hasGroup1 && hasGroup2) {
      return await matchTwoGroups(group1Id, group2Id);
    } else if (hasGroup1 && hasSchool2) {
      return await matchGroupWithSchool(group1Id, school2Id);
    } else if (hasSchool1 && hasGroup2) {
      return await matchGroupWithSchool(group2Id, school1Id);
    } else {
      // Both are schools - existing logic
      return await matchTwoSchools(school1Id, school2Id);
    }
    
  } catch (error) {
    console.error('Error matching units:', error);
    return NextResponse.json(
      { error: 'Failed to match units' },
      { status: 500 }
    );
  }
}

// Match two groups together
async function matchTwoGroups(group1Id: string, group2Id: string) {
  const [group1, group2] = await Promise.all([
    prisma.schoolGroup.findUnique({
      where: { id: group1Id },
      select: {
        id: true,
        name: true,
        matchedWithGroupId: true,
        schools: {
          select: { id: true, schoolName: true, status: true }
        }
      }
    }),
    prisma.schoolGroup.findUnique({
      where: { id: group2Id },
      select: {
        id: true,
        name: true,
        matchedWithGroupId: true,
        schools: {
          select: { id: true, schoolName: true, status: true }
        }
      }
    })
  ]);
  
  if (!group1 || !group2) {
    return NextResponse.json(
      { error: 'One or both groups not found' },
      { status: 404 }
    );
  }
  
  // Check if either group is already matched
  if (group1.matchedWithGroupId) {
    return NextResponse.json(
      { error: `${group1.name} is already matched with another group` },
      { status: 400 }
    );
  }
  if (group2.matchedWithGroupId) {
    return NextResponse.json(
      { error: `${group2.name} is already matched with another group` },
      { status: 400 }
    );
  }
  
  // Match the groups
  await Promise.all([
    prisma.schoolGroup.update({
      where: { id: group1Id },
      data: { matchedWithGroupId: group2Id }
    }),
    prisma.schoolGroup.update({
      where: { id: group2Id },
      data: { matchedWithGroupId: group1Id }
    })
  ]);
  
  return NextResponse.json({
    success: true,
    message: 'Groups successfully matched',
    matchType: 'group-group',
    data: {
      group1: { id: group1.id, name: group1.name },
      group2: { id: group2.id, name: group2.name }
    }
  });
}

// Match a group with an individual school
async function matchGroupWithSchool(groupId: string, schoolId: string) {
  const [group, school] = await Promise.all([
    prisma.schoolGroup.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        matchedWithGroupId: true,
        schools: {
          select: { id: true, schoolName: true, status: true }
        }
      }
    }),
    prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        schoolName: true,
        status: true,
        matchedWithSchoolId: true,
        schoolGroupId: true
      }
    })
  ]);
  
  if (!group || !school) {
    return NextResponse.json(
      { error: 'Group or school not found' },
      { status: 404 }
    );
  }
  
  // Check if school is in a group (shouldn't be matched individually)
  if (school.schoolGroupId) {
    return NextResponse.json(
      { error: `${school.schoolName} is part of a group and cannot be matched individually` },
      { status: 400 }
    );
  }
  
  // Check if already matched
  if (group.matchedWithGroupId) {
    return NextResponse.json(
      { error: `${group.name} is already matched` },
      { status: 400 }
    );
  }
  if (school.matchedWithSchoolId) {
    return NextResponse.json(
      { error: `${school.schoolName} is already matched` },
      { status: 400 }
    );
  }
  
  // DESIGN DECISION: Store group-school matches using a special marker
  // We'll use a temporary solution: store schoolId in group's matchedWithGroupId as "school:{id}"
  // This allows us to retrieve it later without schema changes
  // TODO: Consider adding matchedWithSchoolId to SchoolGroup model for cleaner implementation
  
  await Promise.all([
    prisma.schoolGroup.update({
      where: { id: groupId },
      data: { matchedWithGroupId: `school:${schoolId}` }
    }),
    prisma.school.update({
      where: { id: schoolId },
      data: { matchedWithSchoolId: null }
    })
  ]);
  
  return NextResponse.json({
    success: true,
    message: 'Group and school successfully matched',
    matchType: 'group-school',
    data: {
      group: { id: group.id, name: group.name },
      school: { id: school.id, name: school.schoolName }
    }
  });
}

// Match two individual schools (existing logic)
async function matchTwoSchools(school1Id: string, school2Id: string) {
  const [school1, school2] = await Promise.all([
    prisma.school.findUnique({
      where: { id: school1Id },
      select: {
        id: true,
        schoolName: true,
        status: true,
        matchedWithSchoolId: true,
        schoolGroupId: true
      }
    }),
    prisma.school.findUnique({
      where: { id: school2Id },
      select: {
        id: true,
        schoolName: true,
        status: true,
        matchedWithSchoolId: true,
        schoolGroupId: true
      }
    })
  ]);
  
  if (!school1 || !school2) {
    return NextResponse.json(
      { 
        error: 'One or both schools not found'
      },
      { status: 404 }
    );
  }
  
  // Check if either school is in a group
  if (school1.schoolGroupId) {
    return NextResponse.json(
      { error: `${school1.schoolName} is part of a group and cannot be matched individually` },
      { status: 400 }
    );
  }
  if (school2.schoolGroupId) {
    return NextResponse.json(
      { error: `${school2.schoolName} is part of a group and cannot be matched individually` },
      { status: 400 }
    );
  }
  
  // Check if either school is already matched
  if (school1.matchedWithSchoolId) {
    return NextResponse.json(
      { error: `${school1.schoolName} is already matched with another school` },
      { status: 400 }
    );
  }
  if (school2.matchedWithSchoolId) {
    return NextResponse.json(
      { error: `${school2.schoolName} is already matched with another school` },
      { status: 400 }
    );
  }
  
  // Allow matching schools in COLLECTING or READY status
  const allowedStatuses = ['COLLECTING', 'READY'];
  
  if (!allowedStatuses.includes(school1.status)) {
    return NextResponse.json(
      { error: `${school1.schoolName} cannot be matched (current status: ${school1.status})` },
      { status: 400 }
    );
  }
  if (!allowedStatuses.includes(school2.status)) {
    return NextResponse.json(
      { error: `${school2.schoolName} cannot be matched (current status: ${school2.status})` },
      { status: 400 }
    );
  }
  
  const [updatedSchool1, updatedSchool2] = await Promise.all([
    prisma.school.update({
      where: { id: school1Id },
      data: { matchedWithSchoolId: school2Id }
    }),
    prisma.school.update({
      where: { id: school2Id },
      data: { matchedWithSchoolId: school1Id }
    })
  ]);
  
  return NextResponse.json({
    success: true,
    message: 'Schools successfully matched',
    matchType: 'school-school',
    data: {
      school1: {
        id: updatedSchool1.id,
        name: updatedSchool1.schoolName,
        status: updatedSchool1.status
      },
      school2: {
        id: updatedSchool2.id,
        name: updatedSchool2.schoolName,
        status: updatedSchool2.status
      }
    }
  });
}

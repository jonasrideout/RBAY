// app/api/admin/assign-penpals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchStudents, generateMatchingSummary } from '@/app/lib/student-matching';

export async function POST(request: NextRequest) {
  try {
    const { school1Id, school2Id, group1Id, group2Id } = await request.json();

    // Validate that we have exactly 2 units to match
    const hasSchool1 = !!school1Id;
    const hasSchool2 = !!school2Id;
    const hasGroup1 = !!group1Id;
    const hasGroup2 = !!group2Id;
    
    const unitCount = [hasSchool1, hasSchool2, hasGroup1, hasGroup2].filter(Boolean).length;
    if (unitCount !== 2) {
      return NextResponse.json(
        { error: 'Must provide exactly two units to match (2 schools, 2 groups, or 1 school + 1 group)' },
        { status: 400 }
      );
    }

    // Determine match type and execute appropriate logic
    if (hasGroup1 && hasGroup2) {
      return await assignPenpalsForTwoGroups(group1Id, group2Id);
    } else if (hasGroup1 && hasSchool2) {
      return await assignPenpalsForGroupAndSchool(group1Id, school2Id);
    } else if (hasSchool1 && hasGroup2) {
      return await assignPenpalsForGroupAndSchool(group2Id, school1Id);
    } else {
      // Both are schools - existing logic
      return await assignPenpalsForTwoSchools(school1Id, school2Id);
    }

  } catch (error) {
    console.error('Error assigning pen pals:', error);
    return NextResponse.json(
      { error: 'Failed to assign pen pals' },
      { status: 500 }
    );
  }
}

// Assign pen pals for two groups
async function assignPenpalsForTwoGroups(group1Id: string, group2Id: string) {
  // Fetch both groups with all their schools and students
  const [group1, group2] = await Promise.all([
    prisma.schoolGroup.findUnique({
      where: { id: group1Id },
      include: {
        schools: {
          include: {
            students: {
              where: {
                isActive: true,
                profileCompleted: true
              }
            }
          }
        }
      }
    }),
    prisma.schoolGroup.findUnique({
      where: { id: group2Id },
      include: {
        schools: {
          include: {
            students: {
              where: {
                isActive: true,
                profileCompleted: true
              }
            }
          }
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

  // Aggregate all students from all schools in each group
  const group1Students = group1.schools.flatMap(school => 
    school.students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastInitial: student.lastInitial,
      grade: student.grade,
      interests: student.interests,
      schoolId: student.schoolId,
      penpalPreference: student.penpalPreference
    }))
  );

  const group2Students = group2.schools.flatMap(school =>
    school.students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastInitial: student.lastInitial,
      grade: student.grade,
      interests: student.interests,
      schoolId: student.schoolId,
      penpalPreference: student.penpalPreference
    }))
  );

  if (group1Students.length === 0 || group2Students.length === 0) {
    return NextResponse.json(
      { error: 'Both groups must have students with completed profiles' },
      { status: 400 }
    );
  }

  // Generate student matches using the matching algorithm
  const matches = matchStudents(group1Students, group2Students);
  const summary = generateMatchingSummary(matches, group1Students, group2Students);

  // Create StudentPenpal records in database
  const penpalRecords = await Promise.all(
    matches.map(match => 
      prisma.studentPenpal.create({
        data: {
          studentId: match.student1Id,
          penpalId: match.student2Id
        }
      })
    )
  );

  // Update all schools in both groups to MATCHED status
  await Promise.all([
    ...group1.schools.map(school =>
      prisma.school.update({
        where: { id: school.id },
        data: { status: 'MATCHED' }
      })
    ),
    ...group2.schools.map(school =>
      prisma.school.update({
        where: { id: school.id },
        data: { status: 'MATCHED' }
      })
    )
  ]);

  return NextResponse.json({
    success: true,
    message: 'Groups matched and pen pals assigned successfully',
    matchType: 'group-group',
    data: {
      totalMatches: matches.length,
      matches: matches,
      summary: summary,
      penpalRecords: penpalRecords.length,
      group1: {
        id: group1.id,
        name: group1.name,
        schoolCount: group1.schools.length,
        studentCount: group1Students.length
      },
      group2: {
        id: group2.id,
        name: group2.name,
        schoolCount: group2.schools.length,
        studentCount: group2Students.length
      }
    }
  });
}

// Assign pen pals for a group and an individual school
async function assignPenpalsForGroupAndSchool(groupId: string, schoolId: string) {
  // Fetch group with all schools and students
  const [group, school] = await Promise.all([
    prisma.schoolGroup.findUnique({
      where: { id: groupId },
      include: {
        schools: {
          include: {
            students: {
              where: {
                isActive: true,
                profileCompleted: true
              }
            }
          }
        }
      }
    }),
    prisma.school.findUnique({
      where: { id: schoolId },
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

  if (!group || !school) {
    return NextResponse.json(
      { error: 'Group or school not found' },
      { status: 404 }
    );
  }

  // Check status
  if (school.status !== 'READY' && school.status !== 'MATCHED') {
    return NextResponse.json(
      { error: `School ${school.schoolName} must be in READY status to be matched` },
      { status: 400 }
    );
  }

  // Aggregate all students from group
  const groupStudents = group.schools.flatMap(school =>
    school.students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastInitial: student.lastInitial,
      grade: student.grade,
      interests: student.interests,
      schoolId: student.schoolId,
      penpalPreference: student.penpalPreference
    }))
  );

  const schoolStudents = school.students.map(student => ({
    id: student.id,
    firstName: student.firstName,
    lastInitial: student.lastInitial,
    grade: student.grade,
    interests: student.interests,
    schoolId: student.schoolId,
    penpalPreference: student.penpalPreference
  }));

  if (groupStudents.length === 0 || schoolStudents.length === 0) {
    return NextResponse.json(
      { error: 'Both group and school must have students with completed profiles' },
      { status: 400 }
    );
  }

  // Generate student matches using the matching algorithm
  const matches = matchStudents(groupStudents, schoolStudents);
  const summary = generateMatchingSummary(matches, groupStudents, schoolStudents);

  // Create StudentPenpal records in database
  const penpalRecords = await Promise.all(
    matches.map(match =>
      prisma.studentPenpal.create({
        data: {
          studentId: match.student1Id,
          penpalId: match.student2Id
        }
      })
    )
  );

  // Update all schools in group and the individual school to MATCHED status
  await Promise.all([
    ...group.schools.map(s =>
      prisma.school.update({
        where: { id: s.id },
        data: { status: 'MATCHED' }
      })
    ),
    prisma.school.update({
      where: { id: schoolId },
      data: { status: 'MATCHED' }
    })
  ]);

  return NextResponse.json({
    success: true,
    message: 'Group and school matched and pen pals assigned successfully',
    matchType: 'group-school',
    data: {
      totalMatches: matches.length,
      matches: matches,
      summary: summary,
      penpalRecords: penpalRecords.length,
      group: {
        id: group.id,
        name: group.name,
        schoolCount: group.schools.length,
        studentCount: groupStudents.length
      },
      school: {
        id: school.id,
        name: school.schoolName,
        studentCount: schoolStudents.length
      }
    }
  });
}

// Assign pen pals for two individual schools (existing logic)
async function assignPenpalsForTwoSchools(school1Id: string, school2Id: string) {
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

  if (!school1 || !school2) {
    return NextResponse.json(
      { 
        error: 'One or both schools not found',
        debug: {
          school1Id,
          school2Id,
          school1Found: !!school1,
          school2Found: !!school2
        }
      },
      { status: 404 }
    );
  }

  // Accept schools in READY status and update them to MATCHED
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
    lastInitial: student.lastInitial,
    grade: student.grade,
    interests: student.interests,
    schoolId: student.schoolId,
    penpalPreference: student.penpalPreference
  }));

  const school2Students = school2.students.map(student => ({
    id: student.id,
    firstName: student.firstName,
    lastInitial: student.lastInitial,
    grade: student.grade,
    interests: student.interests,
    schoolId: student.schoolId,
    penpalPreference: student.penpalPreference
  }));

  if (school1Students.length === 0 || school2Students.length === 0) {
    return NextResponse.json(
      { error: 'Both schools must have students with completed profiles' },
      { status: 400 }
    );
  }

  // Update both schools to MATCHED status and set their matchedWithSchoolId
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
          studentId: match.student1Id,
          penpalId: match.student2Id
        }
      })
    )
  );

  // Return success with updated school info
  return NextResponse.json({
    success: true,
    message: 'Schools matched and pen pals assigned successfully',
    matchType: 'school-school',
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
}

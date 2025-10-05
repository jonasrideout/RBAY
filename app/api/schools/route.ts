export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');
    const dashboardToken = searchParams.get('token');

    let whereClause: any;
    if (dashboardToken) {
      whereClause = { dashboardToken };
    } else if (teacherEmail) {
      whereClause = { teacherEmail };
    } else {
      return NextResponse.json(
        { error: 'Teacher email or dashboard token is required' },
        { status: 400 }
      );
    }

    const school = await prisma.school.findUnique({
      where: whereClause,
      include: {
        students: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastInitial: true,
            grade: true,
            interests: true,
            otherInterests: true,
            profileCompleted: true,
            parentConsent: true,
            createdAt: true,
            penpalConnections: true,
            penpalOf: true,
            penpalPreference: true
          }
        },
        // Include school group information
        schoolGroup: {
          include: {
            schools: {
              include: {
                students: {
                  where: { isActive: true }
                }
              }
            }
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

    // Manually fetch matched school or group data if needed
    let matchedWithSchool = undefined;
    
    // First check if this school's GROUP is matched (takes priority)
    if (school.schoolGroup?.matchedWithGroupId) {
      const groupMatchId = school.schoolGroup.matchedWithGroupId;
      
      if (groupMatchId.startsWith('school:')) {
        // Group is matched with a school
        const matchedSchoolId = groupMatchId.replace('school:', '');
        const matchedSchool = await prisma.school.findUnique({
          where: { id: matchedSchoolId },
          select: {
            id: true,
            schoolName: true,
            teacherName: true,
            teacherEmail: true,
            schoolCity: true,
            schoolState: true,
            expectedClassSize: true,
            region: true,
            mailingAddress: true,
            communicationPlatforms: true
          }
        });
        
        if (matchedSchool) {
          matchedWithSchool = {
            ...matchedSchool,
            isGroup: false
          };
        }
      } else {
        // Group is matched with another group
        const matchedGroup = await prisma.schoolGroup.findUnique({
          where: { id: groupMatchId },
          include: {
            schools: {
              select: {
                id: true,
                schoolName: true,
                teacherName: true,
                teacherEmail: true,
                schoolCity: true,
                schoolState: true,
                expectedClassSize: true,
                region: true,
                mailingAddress: true,
                communicationPlatforms: true
              }
            }
          }
        });
        
        if (matchedGroup) {
          const totalExpectedClassSize = matchedGroup.schools.reduce(
            (sum, s) => sum + s.expectedClassSize, 0
          );
          
          matchedWithSchool = {
            id: matchedGroup.id,
            schoolName: matchedGroup.name,
            teacherName: matchedGroup.schools.map(s => s.teacherName).join(', '),
            teacherEmail: matchedGroup.schools.map(s => s.teacherEmail).join(', '),
            schoolCity: matchedGroup.schools[0]?.schoolCity || '',
            schoolState: matchedGroup.schools[0]?.schoolState || '',
            expectedClassSize: totalExpectedClassSize,
            region: matchedGroup.schools[0]?.region || '',
            isGroup: true,
            schools: matchedGroup.schools
          };
        }
      }
    }
    // If school is not in a group, check if the school itself is matched
    else if (school.matchedWithSchoolId) {
      // Check if it's a cross-type match (group marker)
      if (school.matchedWithSchoolId.startsWith('group:')) {
        // This school is matched with a group - fetch group data
        const groupId = school.matchedWithSchoolId.replace('group:', '');
        const matchedGroup = await prisma.schoolGroup.findUnique({
          where: { id: groupId },
          include: {
            schools: {
              select: {
                id: true,
                schoolName: true,
                teacherName: true,
                teacherEmail: true,
                schoolCity: true,
                schoolState: true,
                expectedClassSize: true,
                region: true,
                mailingAddress: true,
                communicationPlatforms: true
              }
            }
          }
        });
        
        if (matchedGroup) {
          // Format group data to look like a "super school" for display purposes
          // Aggregate data from all schools in the group
          const totalExpectedClassSize = matchedGroup.schools.reduce(
            (sum, s) => sum + s.expectedClassSize, 0
          );
          
          matchedWithSchool = {
            id: matchedGroup.id,
            schoolName: matchedGroup.name, // Group name
            teacherName: matchedGroup.schools.map(s => s.teacherName).join(', '),
            teacherEmail: matchedGroup.schools.map(s => s.teacherEmail).join(', '),
            schoolCity: matchedGroup.schools[0]?.schoolCity || '',
            schoolState: matchedGroup.schools[0]?.schoolState || '',
            expectedClassSize: totalExpectedClassSize,
            region: matchedGroup.schools[0]?.region || '',
            isGroup: true,
            schools: matchedGroup.schools // Include full school list for group
          };
        }
      } else {
        // Regular school-to-school match - fetch the full matched school data
        const matchedSchool = await prisma.school.findUnique({
          where: { id: school.matchedWithSchoolId },
          select: {
            id: true,
            schoolName: true,
            teacherName: true,
            teacherEmail: true,
            schoolCity: true,
            schoolState: true,
            expectedClassSize: true,
            region: true,
            mailingAddress: true,
            communicationPlatforms: true
          }
        });
        
        if (matchedSchool) {
          matchedWithSchool = {
            ...matchedSchool,
            isGroup: false
          };
        }
      }
    }

    // Calculate student statistics
    const studentStats = {
      expected: school.expectedClassSize || 0,
      registered: school.students.length,
      ready: school.students.filter(s => s.profileCompleted).length
    };

    // Calculate pen pal statistics
    const studentsWithPenpals = school.students.filter(student => 
      student.penpalConnections.length > 0 || student.penpalOf.length > 0
    );

    return NextResponse.json({
      success: true,
      school: {
        ...school,
        matchedWithSchool,
        studentStats: {
          ...studentStats,
          studentsWithPenpals: studentsWithPenpals.length,
          hasPenpalAssignments: studentsWithPenpals.length > 0
        }
      }
    });

  } catch (error: any) {
    console.error('Get school error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve school information' },
      { status: 500 }
    );
  }
}

// /app/api/schools/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/email';
import { createTeacherSession, setSessionCookie } from '@/lib/magicLink';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      teacherName,
      teacherEmail,
      teacherPhone,
      schoolName,
      schoolAddress,
      schoolCity,
      schoolState,
      schoolCountry,
      schoolZip,
      region,
      gradeLevel,
      expectedClassSize,
      startMonth,
      specialConsiderations,
      communicationPlatforms,
      mailingAddress,
      isAdminFlow,
      isEmailVerified
    } = body;

    // Conditional validation based on admin context
    if (isAdminFlow) {
      if (!teacherName || !teacherEmail || !schoolName) {
        return NextResponse.json(
          { error: 'Missing required fields: Teacher Name, Teacher Email, and School Name are required' },
          { status: 400 }
        );
      }
    } else {
      const isUSSchool = schoolCountry === 'United States';
      
      if (!teacherName || !teacherEmail || !schoolName || 
          !gradeLevel || !expectedClassSize || !startMonth || !mailingAddress) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      // State is only required for US schools
      if (isUSSchool && !schoolState) {
        return NextResponse.json(
          { error: 'State is required for US schools' },
          { status: 400 }
        );
      }
      
      // Validate communication platforms in non-admin mode
      if (!communicationPlatforms || communicationPlatforms.length === 0) {
        return NextResponse.json(
          { error: 'At least one communication platform is required' },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate state format only for US schools
    if (schoolCountry === 'United States' && schoolState && schoolState.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid state format' },
        { status: 400 }
      );
    }

    // Only validate region if it's a US school with a state
    if (schoolCountry === 'United States' && schoolState && !region) {
      return NextResponse.json(
        { error: 'Region is required for US schools' },
        { status: 400 }
      );
    }

    // Check if school with this email already exists
    const existingSchool = await prisma.school.findUnique({
      where: { teacherEmail }
    });

    if (existingSchool) {
      return NextResponse.json(
        { error: 'A school with this teacher email already exists' },
        { status: 409 }
      );
    }

    // Create the school
    const isUSSchool = schoolCountry === 'United States';
    
    const school = await prisma.school.create({
      data: {
        teacherName,
        teacherEmail,
        teacherPhone: teacherPhone || null,
        schoolName,
        schoolAddress: schoolAddress || null,
        schoolCity: schoolCity || null,
        schoolState: schoolState || (isUSSchool ? 'TBD' : null),
        schoolCountry: schoolCountry || 'United States',
        schoolZip: schoolZip || null,
        region: region || (isUSSchool ? 'TBD' : schoolCountry),
        gradeLevel: gradeLevel || 'TBD',
        expectedClassSize: expectedClassSize ? parseInt(expectedClassSize) : 0,
        startMonth: startMonth || 'TBD',
        status: 'COLLECTING',
        specialConsiderations: specialConsiderations || null,
        communicationPlatforms: communicationPlatforms || null,
        mailingAddress: mailingAddress || null
      }
    });

    // Send welcome email - both admin and regular flows
    let emailSent = false;
    let emailError = '';
    
    try {
      const emailResult = await sendWelcomeEmail({
        teacherName,
        teacherEmail,
        schoolName,
        dashboardToken: school.dashboardToken,
        isAdminCreated: isAdminFlow // Pass admin context flag
      });
      
      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error || 'Unknown email error';
        console.warn('Welcome email failed to send:', emailError);
      }
    } catch (error: any) {
      console.warn('Welcome email sending failed:', error);
      emailError = error.message || 'Email service unavailable';
    }

    // Send admin notification (don't block on failure)
    try {
      await sendAdminNotification({
        schoolName,
        teacherName,
        teacherEmail,
        action: 'registration'
      });
    } catch (error: any) {
      console.warn('Admin notification failed:', error);
    }
    
    // Generate links for admin response
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
    const dashboardLink = `${baseUrl}/dashboard?token=${school.dashboardToken}`;
    const registrationLink = `${baseUrl}/register-student`;

    const responseData = {
      success: true,
      school: {
        id: school.id,
        teacherEmail: school.teacherEmail,
        dashboardToken: school.dashboardToken,
        schoolName: school.schoolName,
        teacherName: school.teacherName,
        schoolState: school.schoolState,
        region: school.region,
        status: school.status
      },
      emailSent,
      emailError: emailSent ? undefined : emailError,
      dashboardLink,
      registrationLink
    };

    const response = NextResponse.json(responseData, { status: 201 });

    // Create teacher session for email-verified users
    if (isEmailVerified && !isAdminFlow) {
      const teacherSession = createTeacherSession(teacherEmail);
      setSessionCookie(response, teacherSession);
      console.log('Created teacher session after school registration for:', teacherEmail);
    }

    return response;

  } catch (error: any) {
    console.error('School registration error:', error);
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A school with this teacher email already exists' },
        { status: 409 }
      );
    }

    if (error?.code === 'P2010' || error?.message?.includes('column')) {
      return NextResponse.json(
        { error: 'Database schema needs to be updated. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to register school. Please try again.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      schoolId,
      teacherPhone,
      schoolAddress,
      schoolCity,
      schoolState,
      schoolZip,
      region,
      gradeLevel,
      expectedClassSize,
      startMonth,
      specialConsiderations,
      mailingAddress,
      communicationPlatforms
    } = body;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required for updates' },
        { status: 400 }
      );
    }

    if (!schoolState || !gradeLevel || !expectedClassSize || !startMonth || !mailingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: State, Grade Level, Expected Class Size, Start Month, and Mailing Address are required' },
        { status: 400 }
      );
    }

    if (schoolState.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid state format' },
        { status: 400 }
      );
    }

    if (!region) {
      return NextResponse.json(
        { error: 'Region is required when state is provided' },
        { status: 400 }
      );
    }

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        teacherPhone: teacherPhone || null,
        schoolAddress: schoolAddress || null,
        schoolCity: schoolCity || null,
        schoolState,
        schoolZip: schoolZip || null,
        region,
        gradeLevel,
        expectedClassSize: parseInt(expectedClassSize),
        startMonth,
        specialConsiderations: specialConsiderations || null,
        mailingAddress: mailingAddress || null,
        communicationPlatforms: communicationPlatforms || null
      }
    });

    return NextResponse.json({
      success: true,
      school: updatedSchool
    });

  } catch (error: any) {
    console.error('School update error:', error);
    
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update school information' },
      { status: 500 }
    );
  }
}

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
            schoolCountry: true,
            expectedClassSize: true,
            region: true,
            mailingAddress: true,
            communicationPlatforms: true,
            students: {
              where: { isActive: true },
              select: { id: true }
            }
          }
        });
        
        if (matchedSchool) {
          matchedWithSchool = {
            id: matchedSchool.id,
            schoolName: matchedSchool.schoolName,
            teacherName: matchedSchool.teacherName,
            teacherEmail: matchedSchool.teacherEmail,
            schoolCity: matchedSchool.schoolCity,
            schoolState: matchedSchool.schoolState,
            schoolCountry: matchedSchool.schoolCountry,
            expectedClassSize: matchedSchool.expectedClassSize,
            actualStudentCount: matchedSchool.students.length,
            region: matchedSchool.region,
            mailingAddress: matchedSchool.mailingAddress,
            communicationPlatforms: matchedSchool.communicationPlatforms,
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
                communicationPlatforms: true,
                students: {
                  where: { isActive: true },
                  select: { id: true }
                }
              }
            }
          }
        });
        
        if (matchedGroup) {
          const totalExpectedClassSize = matchedGroup.schools.reduce(
            (sum, s) => sum + s.expectedClassSize, 0
          );
          const totalActualStudents = matchedGroup.schools.reduce(
            (sum, s) => sum + s.students.length, 0
          );
          
          matchedWithSchool = {
            id: matchedGroup.id,
            schoolName: matchedGroup.name,
            teacherName: matchedGroup.schools.map(s => s.teacherName).join(', '),
            teacherEmail: matchedGroup.schools.map(s => s.teacherEmail).join(', '),
            schoolCity: matchedGroup.schools[0]?.schoolCity || '',
            schoolState: matchedGroup.schools[0]?.schoolState || '',
            expectedClassSize: totalExpectedClassSize,
            actualStudentCount: totalActualStudents,
            region: matchedGroup.schools[0]?.region || '',
            isGroup: true,
            schools: matchedGroup.schools.map(s => ({
              id: s.id,
              schoolName: s.schoolName,
              teacherName: s.teacherName,
              teacherEmail: s.teacherEmail,
              schoolCity: s.schoolCity,
              schoolState: s.schoolState,
                schoolCountry: s.schoolCountry,
              expectedClassSize: s.expectedClassSize,
              actualStudentCount: s.students.length,
              region: s.region,
              mailingAddress: s.mailingAddress,
              communicationPlatforms: s.communicationPlatforms
            }))
          };
        }
      }
    }
    // Second check: If school is not in a group, check if the school itself is matched
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
                communicationPlatforms: true,
                students: {
                  where: { isActive: true },
                  select: { id: true }
                }
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
          const totalActualStudents = matchedGroup.schools.reduce(
            (sum, s) => sum + s.students.length, 0
          );
          
          matchedWithSchool = {
            id: matchedGroup.id,
            schoolName: matchedGroup.name, // Group name
            teacherName: matchedGroup.schools.map(s => s.teacherName).join(', '),
            teacherEmail: matchedGroup.schools.map(s => s.teacherEmail).join(', '),
            schoolCity: matchedGroup.schools[0]?.schoolCity || '',
            schoolState: matchedGroup.schools[0]?.schoolState || '',
            expectedClassSize: totalExpectedClassSize,
            actualStudentCount: totalActualStudents,
            region: matchedGroup.schools[0]?.region || '',
            isGroup: true,
            schools: matchedGroup.schools.map(s => ({
              id: s.id,
              schoolName: s.schoolName,
              teacherName: s.teacherName,
              teacherEmail: s.teacherEmail,
              schoolCity: s.schoolCity,
              schoolState: s.schoolState,
                schoolCountry: s.schoolCountry,
              expectedClassSize: s.expectedClassSize,
              actualStudentCount: s.students.length,
              region: s.region,
              mailingAddress: s.mailingAddress,
              communicationPlatforms: s.communicationPlatforms
            }))
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
            communicationPlatforms: true,
            students: {
              where: { isActive: true },
              select: { id: true }
            }
          }
        });
        
        if (matchedSchool) {
          matchedWithSchool = {
            id: matchedSchool.id,
            schoolName: matchedSchool.schoolName,
            teacherName: matchedSchool.teacherName,
            teacherEmail: matchedSchool.teacherEmail,
            schoolCity: matchedSchool.schoolCity,
            schoolState: matchedSchool.schoolState,
            schoolCountry: matchedSchool.schoolCountry,
            expectedClassSize: matchedSchool.expectedClassSize,
            actualStudentCount: matchedSchool.students.length,
            region: matchedSchool.region,
            mailingAddress: matchedSchool.mailingAddress,
            communicationPlatforms: matchedSchool.communicationPlatforms,
            isGroup: false
          };
        }
      }
    }
    // Third check: Is this standalone school matched WITH a group?
    // (Group has matchedWithGroupId = "school:thisSchoolId")
    else {
      const matchedGroup = await prisma.schoolGroup.findFirst({
        where: {
          matchedWithGroupId: `school:${school.id}`
        },
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
              communicationPlatforms: true,
              students: {
                where: { isActive: true },
                select: { id: true }
              }
            }
          }
        }
      });
      
      if (matchedGroup) {
        const totalExpectedClassSize = matchedGroup.schools.reduce(
          (sum, s) => sum + s.expectedClassSize, 0
        );
        const totalActualStudents = matchedGroup.schools.reduce(
          (sum, s) => sum + s.students.length, 0
        );
        
        matchedWithSchool = {
          id: matchedGroup.id,
          schoolName: matchedGroup.name,
          teacherName: matchedGroup.schools.map(s => s.teacherName).join(', '),
          teacherEmail: matchedGroup.schools.map(s => s.teacherEmail).join(', '),
          schoolCity: matchedGroup.schools[0]?.schoolCity || '',
          schoolState: matchedGroup.schools[0]?.schoolState || '',
          expectedClassSize: totalExpectedClassSize,
          actualStudentCount: totalActualStudents,
          region: matchedGroup.schools[0]?.region || '',
          isGroup: true,
          schools: matchedGroup.schools.map(s => ({
            id: s.id,
            schoolName: s.schoolName,
            teacherName: s.teacherName,
            teacherEmail: s.teacherEmail,
            schoolCity: s.schoolCity,
            schoolState: s.schoolState,
                schoolCountry: s.schoolCountry,
            expectedClassSize: s.expectedClassSize,
            actualStudentCount: s.students.length,
            region: s.region,
            mailingAddress: s.mailingAddress,
            communicationPlatforms: s.communicationPlatforms
          }))
        };
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

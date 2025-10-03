// /app/api/admin/all-schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('All-schools using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    console.log('All-schools starting query...');
    
    // Get all schools with their matched school data, students, and pen pal assignments
    const schools = await prisma.school.findMany({
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
            penpalPreference: true,
            penpalConnections: {
              select: {
                id: true,
                penpalId: true
              }
            },
            penpalOf: {
              select: {
                id: true,
                studentId: true
              }
            }
          }
        },
        matchedWithSchool: {
          select: {
            id: true,
            schoolName: true,
            teacherName: true,
            teacherEmail: true,
            schoolCity: true,
            schoolState: true,
            expectedClassSize: true,
            region: true
          }
        },
        schoolGroup: {
          select: {
            id: true,
            name: true,
            matchedWithGroupId: true,
            schools: {
              select: {
                id: true,
                schoolName: true,
                teacherName: true,
                gradeLevel: true,
                specialConsiderations: true,
                students: {
                  where: { isActive: true },
                  select: { id: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Get all school groups with their schools
    const groups = await prisma.schoolGroup.findMany({
      include: {
        schools: {
          select: {
            id: true,
            schoolName: true,
            teacherName: true,
            gradeLevel: true,
            specialConsiderations: true,
            region: true,
            startMonth: true,
            status: true,
            expectedClassSize: true,
            students: {
              where: { isActive: true },
              select: {
                id: true,
                firstName: true,
                lastInitial: true,
                grade: true,
                profileCompleted: true,
                penpalPreference: true,
                penpalConnections: {
                  select: { id: true }
                },
                penpalOf: {
                  select: { id: true }
                }
              }
            }
          }
        },
        matchedWithGroup: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log('All-schools found schools:', schools.length, 'groups:', groups.length);
    
    // Calculate pen pal assignments for each school
    const transformedSchools = schools.map(school => {
      // Count students with pen pal assignments
      const studentsWithPenPals = school.students.filter(student => 
        student.penpalConnections.length > 0 || student.penpalOf.length > 0
      );
      
      // Calculate pen pal assignment status
      const totalStudents = school.students.length;
      const studentsWithAssignments = studentsWithPenPals.length;
      const hasPenPalAssignments = studentsWithAssignments > 0;
      const allStudentsAssigned = totalStudents > 0 && studentsWithAssignments === totalStudents;
      
      // Calculate pen pal preference requirements
      const studentsWithMultiple = school.students.filter(s => s.penpalPreference === 'MULTIPLE').length;
      const classSize = totalStudents;
      const requiredMultiple = classSize > 0 ? Math.min(
        Math.ceil((30 - classSize) / 2),
        Math.floor(classSize * 0.8)
      ) : 0;
      const meetsPreferenceRequirement = studentsWithMultiple >= requiredMultiple;
      
      return {
        id: school.id,
        schoolName: school.schoolName,
        teacherName: school.teacherName,
        teacherEmail: school.teacherEmail,
        teacherPhone: school.teacherPhone,
        dashboardToken: school.dashboardToken,
        region: school.region,
        gradeLevel: school.gradeLevel,
        expectedClassSize: school.expectedClassSize,
        startMonth: school.startMonth,
        specialConsiderations: school.specialConsiderations,
        status: school.status,
        letterFrequency: school.letterFrequency,
        lettersSent: school.lettersSent,
        lettersReceived: school.lettersReceived,
        matchedWithSchoolId: school.matchedWithSchoolId,
        schoolGroupId: school.schoolGroupId,
        matchedSchool: school.matchedWithSchool,
        schoolGroup: school.schoolGroup ? {
          id: school.schoolGroup.id,
          name: school.schoolGroup.name,
          matchedWithGroupId: school.schoolGroup.matchedWithGroupId,
          schools: school.schoolGroup.schools.map(s => ({
            id: s.id,
            schoolName: s.schoolName,
            teacherName: s.teacherName,
            gradeLevel: s.gradeLevel,
            specialConsiderations: s.specialConsiderations,
            studentCount: s.students.length
          }))
        } : undefined,
        students: school.students.map(student => ({
          id: student.id,
          firstName: student.firstName,
          lastInitial: student.lastInitial,
          grade: student.grade,
          interests: student.interests,
          otherInterests: student.otherInterests,
          profileCompleted: student.profileCompleted,
          parentConsent: student.parentConsent,
          createdAt: student.createdAt,
          penpalPreference: student.penpalPreference
        })),
        studentCounts: {
          expected: school.expectedClassSize,
          registered: school.students.length,
          ready: school.students.filter(s => s.profileCompleted).length
        },
        penPalAssignments: {
          hasAssignments: hasPenPalAssignments,
          studentsWithPenPals: studentsWithAssignments,
          totalStudents: totalStudents,
          allStudentsAssigned: allStudentsAssigned,
          assignmentPercentage: totalStudents > 0 ? Math.round((studentsWithAssignments / totalStudents) * 100) : 0
        },
        penPalPreferences: {
          studentsWithMultiple: studentsWithMultiple,
          requiredMultiple: requiredMultiple,
          meetsRequirement: meetsPreferenceRequirement
        }
      };
    });
    
    // Transform groups with aggregated data
    const transformedGroups = groups.map(group => {
      // Aggregate all students from all schools in the group
      const allStudents = group.schools.flatMap(school => school.students);
      
      // Count students with pen pal assignments
      const studentsWithPenPals = allStudents.filter(student => 
        student.penpalConnections.length > 0 || student.penpalOf.length > 0
      );
      
      const totalStudents = allStudents.length;
      const studentsWithAssignments = studentsWithPenPals.length;
      const hasPenPalAssignments = studentsWithAssignments > 0;
      const allStudentsAssigned = totalStudents > 0 && studentsWithAssignments === totalStudents;
      
      // Calculate pen pal preference requirements for the group
      const studentsWithMultiple = allStudents.filter(s => s.penpalPreference === 'MULTIPLE').length;
      const classSize = totalStudents;
      const requiredMultiple = classSize > 0 ? Math.min(
        Math.ceil((30 - classSize) / 2),
        Math.floor(classSize * 0.8)
      ) : 0;
      const meetsPreferenceRequirement = studentsWithMultiple >= requiredMultiple;
      
      // Determine if group is ready for matching (all schools must be READY or COLLECTING)
      const allSchoolsReady = group.schools.every(school => 
        ['COLLECTING', 'READY'].includes(school.status)
      );
      
      return {
        id: group.id,
        name: group.name,
        type: 'group' as const,
        matchedWithGroupId: group.matchedWithGroupId,
        matchedWithGroup: group.matchedWithGroup,
        schools: group.schools.map(school => ({
          id: school.id,
          schoolName: school.schoolName,
          teacherName: school.teacherName,
          gradeLevel: school.gradeLevel,
          specialConsiderations: school.specialConsiderations,
          region: school.region,
          startMonth: school.startMonth,
          status: school.status,
          expectedClassSize: school.expectedClassSize,
          studentCount: school.students.length
        })),
        studentCounts: {
          total: totalStudents,
          ready: allStudents.filter(s => s.profileCompleted).length
        },
        penPalAssignments: {
          hasAssignments: hasPenPalAssignments,
          studentsWithPenPals: studentsWithAssignments,
          totalStudents: totalStudents,
          allStudentsAssigned: allStudentsAssigned,
          assignmentPercentage: totalStudents > 0 ? Math.round((studentsWithAssignments / totalStudents) * 100) : 0
        },
        penPalPreferences: {
          studentsWithMultiple: studentsWithMultiple,
          requiredMultiple: requiredMultiple,
          meetsRequirement: meetsPreferenceRequirement
        },
        isReadyForMatching: allSchoolsReady && totalStudents > 0
      };
    });
    
    // Calculate status counts
    const statusCounts = transformedSchools.reduce((acc, school) => {
      acc[school.status] = (acc[school.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Ensure all statuses are represented
    const completeStatusCounts = {
      COLLECTING: statusCounts.COLLECTING || 0,
      READY: statusCounts.READY || 0,
      MATCHED: statusCounts.MATCHED || 0,
      CORRESPONDING: statusCounts.CORRESPONDING || 0,
      DONE: statusCounts.DONE || 0
    };
    
    console.log('All-schools returning data - schools:', transformedSchools.length, 'groups:', transformedGroups.length);
    
    const response = NextResponse.json({
      schools: transformedSchools,
      groups: transformedGroups,
      statusCounts: completeStatusCounts,
      totalSchools: transformedSchools.length,
      totalGroups: transformedGroups.length
    });

    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('All-schools error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

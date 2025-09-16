// app/api/admin/match-schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { school1Id, school2Id } = await request.json();
    
    if (!school1Id || !school2Id) {
      return NextResponse.json(
        { error: 'Both school1Id and school2Id are required' },
        { status: 400 }
      );
    }
    
    if (school1Id === school2Id) {
      return NextResponse.json(
        { error: 'Cannot match a school with itself' },
        { status: 400 }
      );
    }
    
    // Fetch both schools
    const [school1, school2] = await Promise.all([
      prisma.school.findUnique({
        where: { id: school1Id },
        select: {
          id: true,
          schoolName: true,
          status: true,
          matchedWithSchoolId: true
        }
      }),
      prisma.school.findUnique({
        where: { id: school2Id },
        select: {
          id: true,
          schoolName: true,
          status: true,
          matchedWithSchoolId: true
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
    
    // FIXED: Only set matchedWithSchoolId, preserve existing status
    const [updatedSchool1, updatedSchool2] = await Promise.all([
      prisma.school.update({
        where: { id: school1Id },
        data: { 
          matchedWithSchoolId: school2Id
          // Removed: status: 'MATCHED' - schools keep their current status
        }
      }),
      prisma.school.update({
        where: { id: school2Id },
        data: { 
          matchedWithSchoolId: school1Id
          // Removed: status: 'MATCHED' - schools keep their current status
        }
      })
    ]);
    
    // Return success with updated school info
    return NextResponse.json({
      success: true,
      message: 'Schools successfully matched',
      data: {
        school1: {
          id: updatedSchool1.id,
          name: updatedSchool1.schoolName,
          status: updatedSchool1.status,
          matchedWithSchoolId: updatedSchool1.matchedWithSchoolId
        },
        school2: {
          id: updatedSchool2.id,
          name: updatedSchool2.schoolName,
          status: updatedSchool2.status,
          matchedWithSchoolId: updatedSchool2.matchedWithSchoolId
        }
      }
    });
    
  } catch (error) {
    console.error('Error matching schools:', error);
    return NextResponse.json(
      { error: 'Failed to match schools' },
      { status: 500 }
    );
  }
}

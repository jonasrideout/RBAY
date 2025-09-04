// /app/api/schools/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      schoolZip,
      region,
      gradeLevel,
      expectedClassSize,
      startMonth,
      specialConsiderations
    } = body;

    // Updated validation - removed letterFrequency requirement
    if (!teacherName || !teacherEmail || !schoolName || 
        !schoolState || !gradeLevel || !expectedClassSize || !startMonth) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate state format (should be 2-letter code)
    if (!schoolState || schoolState.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid state format' },
        { status: 400 }
      );
    }

    // Validate region is provided
    if (!region) {
      return NextResponse.json(
        { error: 'Region is required' },
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

    // Create the school - removed letterFrequency field
    const school = await prisma.school.create({
      data: {
        teacherName,
        teacherEmail,
        teacherPhone: teacherPhone || null,
        schoolName,
        schoolAddress: schoolAddress || null, // Optional - empty for now
        schoolCity: schoolCity || null, // Optional - may be provided
        schoolState,
        schoolZip: schoolZip || null, // Optional - empty for now
        region,
        gradeLevel,
        expectedClassSize: parseInt(expectedClassSize),
        startMonth,
        status: 'COLLECTING', // New schools start in collecting status
        specialConsiderations: specialConsiderations || null
      }
    });

    return NextResponse.json({
      success: true,
      school: {
        id: school.id,
        teacherEmail: school.teacherEmail,
        schoolName: school.schoolName,
        schoolState: school.schoolState,
        region: school.region,
        status: school.status
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('School registration error:', error);
    
    // Handle Prisma errors more specifically
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A school with this teacher email already exists' },
        { status: 409 }
      );
    }

    // Handle missing column errors (if schema not updated yet)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');

    if (!teacherEmail) {
      return NextResponse.json(
        { error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    const school = await prisma.school.findUnique({
      where: { teacherEmail },
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
            createdAt: true
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

    // Calculate student statistics
    const studentStats = {
      expected: school.expectedClassSize,
      registered: school.students.length,
      ready: school.students.filter(s => s.profileCompleted).length
    };

    return NextResponse.json({
      success: true,
      school: {
        ...school,
        studentStats
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

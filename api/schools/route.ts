import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      teacherFirstName,
      teacherLastName,
      teacherEmail,
      teacherPhone,
      schoolName,
      schoolAddress,
      gradeLevels,
      classSize,
      programStartMonth,
      letterFrequency,
      specialConsiderations,
      programAgreement,
      parentNotification
    } = body;

    // Validate required fields
    if (!teacherFirstName || !teacherLastName || !teacherEmail || !schoolName || 
        !schoolAddress || !gradeLevels || !classSize || !programStartMonth || 
        !letterFrequency || !programAgreement || !parentNotification) {
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
    const school = await prisma.school.create({
      data: {
        teacherFirstName,
        teacherLastName,
        teacherEmail,
        teacherPhone: teacherPhone || null,
        schoolName,
        schoolAddress,
        gradeLevels,
        classSize: parseInt(classSize),
        programStartMonth,
        letterFrequency,
        specialConsiderations: specialConsiderations || null,
        programAgreement,
        parentNotification
      }
    });

    return NextResponse.json({
      success: true,
      school: {
        id: school.id,
        teacherEmail: school.teacherEmail,
        schoolName: school.schoolName
      }
    }, { status: 201 });

  } catch (error) {
    console.error('School registration error:', error);
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
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            interests: true,
            otherInterests: true,
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

    return NextResponse.json({
      success: true,
      school
    });

  } catch (error) {
    console.error('Get school error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve school information' },
      { status: 500 }
    );
  }
}

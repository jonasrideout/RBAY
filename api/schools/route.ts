import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Legacy API route - should be migrated to app/api/schools/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle student registration (legacy functionality)
    if (body.firstName) {
      const {
        firstName,
        lastName,
        grade,
        interests,
        parentFirstName,
        parentLastName,
        parentEmail,
        parentPhone,
        parentConsent,
        teacherEmail
      } = body;

      // Find the school by teacher email
      const school = await prisma.school.findUnique({
        where: { teacherEmail }
      });

      if (!school) {
        return NextResponse.json(
          { error: 'School not found for this teacher email' },
          { status: 404 }
        );
      }

      // Check if student interests are completed
      const profileCompleted = interests && interests.length > 0;

      // Create the student
      const student = await prisma.student.create({
        data: {
          firstName,
          lastName,
          grade,
          interests: interests || [],
          parentFirstName,
          parentLastName,
          parentEmail,
          parentPhone,
          parentConsent: parentConsent || false,
          isActive: true,
          profileCompleted,
          schoolId: school.id
        }
      });

      return NextResponse.json({
        message: 'Student registered successfully',
        student
      });
    }

    // Handle school registration (legacy functionality)
    return NextResponse.json(
      { error: 'School registration should use /app/api/schools/route.ts' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Legacy API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

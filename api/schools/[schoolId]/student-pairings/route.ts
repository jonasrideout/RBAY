// /app/api/schools/[schoolId]/student-pairings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { schoolId: string } }
) {
  try {
    const schoolId = params.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Check if any students from this school have pen pal connections
    const studentPairings = await prisma.studentPenpal.findMany({
      where: {
        student: {
          schoolId: schoolId
        }
      },
      take: 1 // We only need to know if any exist
    });

    const hasPairings = studentPairings.length > 0;

    return NextResponse.json({
      hasPairings,
      schoolId
    });

  } catch (error) {
    console.error('Error checking student pairings:', error);
    return NextResponse.json(
      { error: 'Failed to check student pairings', hasPairings: false },
      { status: 500 }
    );
  }
}

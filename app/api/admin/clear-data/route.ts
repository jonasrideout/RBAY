import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    // Delete in correct order (students first due to foreign key constraints, then schools)
    const deletedStudents = await prisma.student.deleteMany({});
    const deletedSchools = await prisma.school.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared all data: ${deletedStudents.count} students and ${deletedSchools.count} schools deleted`,
      studentsDeleted: deletedStudents.count,
      schoolsDeleted: deletedSchools.count
    });
  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json({ 
      error: 'Failed to clear data: ' + error.message 
    }, { status: 500 });
  }
}

// Also support GET for easy browser access
export async function GET() {
  try {
    // Delete in correct order (students first due to foreign key constraints, then schools)
    const deletedStudents = await prisma.student.deleteMany({});
    const deletedSchools = await prisma.school.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared all data: ${deletedStudents.count} students and ${deletedSchools.count} schools deleted`,
      studentsDeleted: deletedStudents.count,
      schoolsDeleted: deletedSchools.count
    });
  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json({ 
      error: 'Failed to clear data: ' + error.message 
    }, { status: 500 });
  }
}

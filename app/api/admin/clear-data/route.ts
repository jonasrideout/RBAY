// app/api/admin/clear-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    // Delete in correct order to avoid foreign key constraint violations
    // 1. First delete StudentPenpal records (they reference students)
    const deletedPenpals = await prisma.studentPenpal.deleteMany({});
    
    // 2. Delete SchoolPairing records (they reference schools)
    const deletedSchoolPairings = await prisma.schoolPairing.deleteMany({});
    
    // 3. Clear all matchedWithSchoolId references before deleting schools
    const clearedMatching = await prisma.school.updateMany({
      data: {
        matchedWithSchoolId: null
      }
    });
    
    // 4. Then delete students (they reference schools)
    const deletedStudents = await prisma.student.deleteMany({});
    
    // 5. Finally delete schools (no dependencies)
    const deletedSchools = await prisma.school.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared all data: ${deletedPenpals.count} pen pal assignments, ${deletedSchoolPairings.count} school pairings, ${deletedStudents.count} students, and ${deletedSchools.count} schools deleted`,
      penpalsDeleted: deletedPenpals.count,
      schoolPairingsDeleted: deletedSchoolPairings.count,
      matchingReferencesCleared: clearedMatching.count,
      studentsDeleted: deletedStudents.count,
      schoolsDeleted: deletedSchools.count
    });
  } catch (error: any) {
    console.error('Clear data error:', error);
    return NextResponse.json({ 
      error: 'Failed to clear data: ' + (error?.message || 'Unknown error')
    }, { status: 500 });
  }
}

// Also support GET for easy browser access
export async function GET() {
  try {
    // Delete in correct order to avoid foreign key constraint violations
    // 1. First delete StudentPenpal records (they reference students)
    const deletedPenpals = await prisma.studentPenpal.deleteMany({});
    
    // 2. Delete SchoolPairing records (they reference schools)
    const deletedSchoolPairings = await prisma.schoolPairing.deleteMany({});
    
    // 3. Clear all matchedWithSchoolId references before deleting schools
    const clearedMatching = await prisma.school.updateMany({
      data: {
        matchedWithSchoolId: null
      }
    });
    
    // 4. Then delete students (they reference schools)
    const deletedStudents = await prisma.student.deleteMany({});
    
    // 5. Finally delete schools (no dependencies)
    const deletedSchools = await prisma.school.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared all data: ${deletedPenpals.count} pen pal assignments, ${deletedSchoolPairings.count} school pairings, ${deletedStudents.count} students, and ${deletedSchools.count} schools deleted`,
      penpalsDeleted: deletedPenpals.count,
      schoolPairingsDeleted: deletedSchoolPairings.count,
      matchingReferencesCleared: clearedMatching.count,
      studentsDeleted: deletedStudents.count,
      schoolsDeleted: deletedSchools.count
    });
  } catch (error: any) {
    console.error('Clear data error:', error);
    return NextResponse.json({ 
      error: 'Failed to clear data: ' + (error?.message || 'Unknown error')
    }, { status: 500 });
  }
}

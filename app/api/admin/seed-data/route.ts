import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ADD GET handler to restore browser URL functionality
export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting seed data creation...');

    // Create Pacific School
    const pacificSchool = await prisma.school.create({
      data: {
        schoolName: "Pacific Elementary",
        teacherName: "Sarah Johnson",
        teacherEmail: "sarah.johnson@pacific.edu",
        schoolAddress: "123 Ocean View Drive",
        schoolCity: "San Francisco",
        schoolState: "California",
        schoolZip: "94102",
        gradeLevel: "3,4,5",
        expectedClassSize: 25,
        startMonth: "September",
        specialConsiderations: "We have several students learning English as a second language",
        status: "READY",
        region: "Pacific",
        isActive: true
      }
    });

    // Create Northeast School
    const northeastSchool = await prisma.school.create({
      data: {
        schoolName: "Northeast Academy",
        teacherName: "Michael Chen",
        teacherEmail: "michael.chen@northeast.edu",
        schoolAddress: "456 Maple Street",
        schoolCity: "Boston",
        schoolState: "Massachusetts",
        schoolZip: "02101",
        gradeLevel: "3,4,5",
        expectedClassSize: 22,
        startMonth: "September",
        specialConsiderations: "Students are very excited about cross-country pen pal connections",
        status: "READY",
        region: "Northeast",
        isActive: true
      }
    });

    console.log('Schools created, creating students...');

    // Pacific students with realistic pen pal preferences (30% MULTIPLE, 70% ONE)
    const pacificStudents = [
      { name: "Emma Wilson", grade: "3", interests: ["reading", "art"], preference: "ONE", parent: "Jennifer Wilson" },
      { name: "Liam Rodriguez", grade: "4", interests: ["sports", "science"], preference: "MULTIPLE", parent: "Carlos Rodriguez" },
      { name: "Sophia Kim", grade: "3", interests: ["music", "animals"], preference: "ONE", parent: "Lisa Kim" },
      { name: "Noah Chen", grade: "5", interests: ["technology", "games"], preference: "ONE", parent: "David Chen" },
      { name: "Ava Thompson", grade: "4", interests: ["nature", "hiking"], preference: "MULTIPLE", parent: "Sarah Thompson" },
      { name: "Mason Davis", grade: "3", interests: ["cooking", "family"], preference: "ONE", parent: "Mark Davis" },
      { name: "Isabella Garcia", grade: "5", interests: ["dance", "music"], preference: "ONE", parent: "Maria Garcia" },
      { name: "Ethan Brown", grade: "4", interests: ["sports", "outdoor"], preference: "MULTIPLE", parent: "James Brown" },
      { name: "Mia Johnson", grade: "3", interests: ["art", "crafts"], preference: "ONE", parent: "Amy Johnson" },
      { name: "Alexander Lee", grade: "5", interests: ["reading", "history"], preference: "ONE", parent: "Kevin Lee" },
      { name: "Charlotte Martinez", grade: "4", interests: ["science", "experiments"], preference: "MULTIPLE", parent: "Rosa Martinez" },
      { name: "William Taylor", grade: "3", interests: ["animals", "pets"], preference: "ONE", parent: "Tom Taylor" }
    ];

    // Northeast students with realistic pen pal preferences
    const northeastStudents = [
      { name: "Olivia Anderson", grade: "3", interests: ["reading", "writing"], preference: "ONE", parent: "Linda Anderson" },
      { name: "Lucas White", grade: "4", interests: ["sports", "basketball"], preference: "MULTIPLE", parent: "Robert White" },
      { name: "Amelia Harris", grade: "5", interests: ["art", "painting"], preference: "ONE", parent: "Michelle Harris" },
      { name: "Benjamin Clark", grade: "3", interests: ["science", "space"], preference: "ONE", parent: "Steven Clark" },
      { name: "Harper Lewis", grade: "4", interests: ["music", "piano"], preference: "MULTIPLE", parent: "Rachel Lewis" },
      { name: "Henry Walker", grade: "5", interests: ["technology", "coding"], preference: "ONE", parent: "Daniel Walker" },
      { name: "Evelyn Hall", grade: "3", interests: ["nature", "gardening"], preference: "ONE", parent: "Patricia Hall" },
      { name: "Sebastian Young", grade: "4", interests: ["games", "puzzles"], preference: "MULTIPLE", parent: "Christopher Young" },
      { name: "Abigail King", grade: "5", interests: ["dance", "theater"], preference: "ONE", parent: "Elizabeth King" },
      { name: "Jackson Wright", grade: "3", interests: ["outdoor", "camping"], preference: "ONE", parent: "Matthew Wright" },
      { name: "Emily Lopez", grade: "4", interests: ["cooking", "baking"], preference: "MULTIPLE", parent: "Sandra Lopez" },
      { name: "Owen Hill", grade: "5", interests: ["history", "museums"], preference: "ONE", parent: "Andrew Hill" }
    ];

    // Create Pacific students
    for (const studentData of pacificStudents) {
      const [firstName, lastName] = studentData.name.split(' ');
      await prisma.student.create({
        data: {
          firstName,
          lastName,
          grade: studentData.grade,
          interests: studentData.interests,
          parentName: studentData.parent,
          parentEmail: `${firstName.toLowerCase()}.parent@email.com`,
          parentPhone: `(415) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          parentConsent: true,
          penpalPreference: studentData.preference as "ONE" | "MULTIPLE",
          isActive: true,
          profileCompleted: true,
          schoolId: pacificSchool.id
        }
      });
    }

    // Create Northeast students
    for (const studentData of northeastStudents) {
      const [firstName, lastName] = studentData.name.split(' ');
      await prisma.student.create({
        data: {
          firstName,
          lastName,
          grade: studentData.grade,
          interests: studentData.interests,
          parentName: studentData.parent,
          parentEmail: `${firstName.toLowerCase()}.parent@email.com`,
          parentPhone: `(617) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          parentConsent: true,
          penpalPreference: studentData.preference as "ONE" | "MULTIPLE",
          isActive: true,
          profileCompleted: true,
          schoolId: northeastSchool.id
        }
      });
    }

    console.log('Seed data creation completed successfully');

    return NextResponse.json({
      message: 'Test data created successfully',
      schools: 2,
      pacificStudents: pacificStudents.length,
      northeastStudents: northeastStudents.length,
      totalStudents: pacificStudents.length + northeastStudents.length
    });

  } catch (error) {
    console.error('Seed data creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create test data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

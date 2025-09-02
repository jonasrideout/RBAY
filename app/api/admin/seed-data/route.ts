import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ADD GET handler to restore browser URL functionality
export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting enhanced seed data creation...');

    // Create Pacific School - 20 students (READY status)
    const pacificSchool = await prisma.school.create({
      data: {
        schoolName: "Pacific Elementary",
        teacherName: "Sarah Johnson",
        teacherEmail: "sarah.johnson@pacific.edu",
        teacherPhone: "(415) 555-0101",
        schoolAddress: "123 Ocean View Drive",
        schoolCity: "San Francisco",
        schoolState: "California",
        schoolZip: "94102",
        gradeLevel: "3,4,5",
        expectedClassSize: 20,
        startMonth: "September",
        specialConsiderations: "We have several students learning English as a second language",
        status: "READY",
        region: "Pacific",
        isActive: true
      }
    });

    // Create Northeast School - 23 students (READY status)
    const northeastSchool = await prisma.school.create({
      data: {
        schoolName: "Northeast Academy",
        teacherName: "Michael Chen",
        teacherEmail: "michael.chen@northeast.edu",
        teacherPhone: "(617) 555-0202",
        schoolAddress: "456 Maple Street",
        schoolCity: "Boston",
        schoolState: "Massachusetts",
        schoolZip: "02101",
        gradeLevel: "3,4,5",
        expectedClassSize: 23,
        startMonth: "October",
        specialConsiderations: "Students are very excited about cross-country pen pal connections",
        status: "READY",
        region: "Northeast",
        isActive: true
      }
    });

    // Create Southwest School - 30 students (COLLECTING status for testing)
    const southwestSchool = await prisma.school.create({
      data: {
        schoolName: "Desert View Elementary",
        teacherName: "Maria Rodriguez",
        teacherEmail: "maria.rodriguez@desertview.edu",
        teacherPhone: "(602) 555-0303",
        schoolAddress: "789 Cactus Trail",
        schoolCity: "Phoenix",
        schoolState: "Arizona",
        schoolZip: "85001",
        gradeLevel: "4,5",
        expectedClassSize: 30,
        startMonth: "September",
        specialConsiderations: "Mixed bilingual classroom with advanced writing focus",
        status: "COLLECTING",
        region: "Southwest",
        isActive: true
      }
    });

    console.log('Schools created, creating students...');

    // Enhanced interest combinations and otherInterests examples
    const interestOptions = ["reading", "art", "sports", "science", "music", "animals", "technology", "games", "nature", "hiking", "cooking", "family", "dance", "outdoor", "crafts", "history", "writing", "experiments", "pets"];
    
    const otherInterestsOptions = [
      "Taylor Swift, Harry Potter",
      "Minecraft, Roblox", 
      "Percy Jackson books",
      "Pokemon, anime",
      "TikTok dances",
      "Baking cookies",
      "Soccer, football",
      "Drawing comics",
      "Playing guitar",
      "Skateboarding",
      null, null, null // 30% have otherInterests, 70% don't
    ];

    const gradeOptions = ["3", "4", "5"];
    const firstNames = ["Emma", "Liam", "Sophia", "Noah", "Ava", "Mason", "Isabella", "Ethan", "Mia", "Alexander", "Charlotte", "William", "Grace", "James", "Lily", "Owen", "Zoe", "Caleb", "Olivia", "Lucas", "Amelia", "Benjamin", "Harper", "Henry", "Evelyn", "Sebastian", "Abigail", "Jackson", "Emily", "Logan", "Aria", "Carter", "Chloe", "Wyatt", "Layla", "Luke", "Riley", "Jack", "Zoey", "Daniel"];
    
    const lastNames = ["Wilson", "Rodriguez", "Kim", "Chen", "Thompson", "Davis", "Garcia", "Brown", "Johnson", "Lee", "Martinez", "Taylor", "Patterson", "Mitchell", "Cooper", "Turner", "Adams", "Morgan", "Anderson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall", "Young", "King", "Wright", "Lopez", "Hill", "Green", "Baker", "Nelson", "Carter", "Roberts", "Phillips", "Evans", "Turner", "Parker", "Collins"];

    // Helper function to generate realistic student data
    const generateStudent = (schoolId: string, index: number, areaCode: string) => {
      const firstName = firstNames[index % firstNames.length];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const grade = gradeOptions[Math.floor(Math.random() * gradeOptions.length)];
      
      // Generate 1-3 interests
      const numInterests = Math.floor(Math.random() * 3) + 1;
      const shuffledInterests = [...interestOptions].sort(() => 0.5 - Math.random());
      const interests = shuffledInterests.slice(0, numInterests);
      
      // 25% MULTIPLE preference, 75% ONE preference (realistic distribution)
      const penpalPreference = Math.random() < 0.25 ? "MULTIPLE" : "ONE";
      
      // 30% chance of having otherInterests
      const otherInterests = otherInterestsOptions[Math.floor(Math.random() * otherInterestsOptions.length)];
      
      return {
        firstName,
        lastName,
        grade,
        interests,
        otherInterests,
        parentName: `${firstName} ${lastName} Parent`,
        parentEmail: `${firstName.toLowerCase()}.parent${index}@email.com`,
        parentPhone: `(${areaCode}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        parentConsent: true,
        penpalPreference: penpalPreference as "ONE" | "MULTIPLE",
        isActive: true,
        profileCompleted: true,
        schoolId
      };
    };

    // Create Pacific students (20 students)
    console.log('Creating Pacific Elementary students...');
    for (let i = 0; i < 20; i++) {
      const studentData = generateStudent(pacificSchool.id, i, "415");
      await prisma.student.create({ data: studentData });
    }

    // Create Northeast students (23 students)
    console.log('Creating Northeast Academy students...');
    for (let i = 0; i < 23; i++) {
      const studentData = generateStudent(northeastSchool.id, i + 20, "617");
      await prisma.student.create({ data: studentData });
    }

    // Create Southwest students (30 students - mix of complete/incomplete for testing)
    console.log('Creating Desert View Elementary students...');
    for (let i = 0; i < 30; i++) {
      const studentData = generateStudent(southwestSchool.id, i + 43, "602");
      
      // Create variety in completion status for testing:
      // 20 students complete, 10 students incomplete (missing various fields)
      if (i >= 20) {
        // Make some students incomplete for testing purposes
        if (i % 3 === 0) {
          studentData.profileCompleted = false;
          studentData.interests = []; // Missing interests
        } else if (i % 3 === 1) {
          studentData.profileCompleted = false;
          studentData.penpalPreference = "ONE"; // Missing parent consent
          studentData.parentConsent = false;
        } else {
          studentData.profileCompleted = false;
          studentData.grade = ""; // Missing grade
        }
      }
      
      await prisma.student.create({ data: studentData });
    }

    const totalStudents = 20 + 23 + 30;
    
    console.log('Enhanced seed data creation completed successfully');
    console.log(`Created ${totalStudents} students across 3 schools`);

    return NextResponse.json({
      message: 'Enhanced test data created successfully',
      schools: 3,
      schoolDetails: {
        pacificElementary: { students: 20, status: "READY" },
        northeastAcademy: { students: 23, status: "READY" },
        desertViewElementary: { students: 30, status: "COLLECTING", incomplete: 10 }
      },
      totalStudents,
      testScenarios: [
        "Even vs odd student counts for matching",
        "Different school statuses (READY vs COLLECTING)",
        "Variety of pen pal preferences",
        "Mixed completion states for dashboard testing",
        "Diverse interests and otherInterests examples",
        "Different start months",
        "Various special considerations"
      ]
    });

  } catch (error) {
    console.error('Enhanced seed data creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create enhanced test data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

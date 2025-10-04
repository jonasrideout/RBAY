import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ADD GET handler to restore browser URL functionality
export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Seed-data using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    console.log('Starting enhanced seed data creation...');
    console.log('Seed-data using DATABASE_URL_DIRECT:', process.env.DATABASE_URL_DIRECT?.substring(0, 50) + '...');

    // Create Lincoln Elementary - 10 students (COLLECTING status)
    const lincolnSchool = await prisma.school.create({
      data: {
        schoolName: "Lincoln Elementary",
        teacherName: "Jonas Rideout",
        teacherEmail: "jonas.rideout@gmail.com",
        teacherPhone: "(914) 555-0707",
        schoolAddress: "100 School Street",
        schoolCity: "Yonkers",
        schoolState: "NY",
        schoolZip: "10701",
        gradeLevel: "3",
        expectedClassSize: 10,
        startMonth: "As soon as possible",
        specialConsiderations: null,
        status: "COLLECTING",
        region: "Northeast",
        isActive: true
      }
    });

    // Create Pacific School - 20 students (READY status)
    const pacificSchool = await prisma.school.create({
      data: {
        schoolName: "Pacific Elementary",
        teacherName: "Sarah Johnson",
        teacherEmail: "sarah.johnson@pacific.edu",
        teacherPhone: "(415) 555-0101",
        schoolAddress: "123 Ocean View Drive",
        schoolCity: "San Francisco",
        schoolState: "CA",
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
        schoolState: "MA",
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
        schoolState: "AZ",
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

    // Create Midwest School - 23 students (COLLECTING status for testing)
    const midwestSchool = await prisma.school.create({
      data: {
        schoolName: "Prairie View Middle School",
        teacherName: "Jennifer Williams",
        teacherEmail: "jennifer.williams@prairieview.edu",
        teacherPhone: "(312) 555-0404",
        schoolAddress: "321 Cornfield Avenue",
        schoolCity: "Chicago",
        schoolState: "IL",
        schoolZip: "60601",
        gradeLevel: "3,4",
        expectedClassSize: 23,
        startMonth: "October",
        specialConsiderations: "Urban classroom with focus on cultural exchange",
        status: "COLLECTING",
        region: "Midwest",
        isActive: true
      }
    });

    // Create Southeast School - 20 students (COLLECTING status for testing)
    const southeastSchool = await prisma.school.create({
      data: {
        schoolName: "Magnolia Elementary",
        teacherName: "Robert Davis",
        teacherEmail: "robert.davis@magnolia.edu",
        teacherPhone: "(404) 555-0505",
        schoolAddress: "567 Peachtree Lane",
        schoolCity: "Atlanta",
        schoolState: "GA",
        schoolZip: "30301",
        gradeLevel: "3,4,5",
        expectedClassSize: 20,
        startMonth: "September",
        specialConsiderations: "Strong emphasis on creative writing and storytelling",
        status: "COLLECTING",
        region: "Southeast",
        isActive: true
      }
    });

    // Create Mountain View School - 12 students (COLLECTING status)
    const mountainViewSchool = await prisma.school.create({
      data: {
        schoolName: "Mountain View Elementary",
        teacherName: "Emily Carter",
        teacherEmail: "rightbackatyou13@gmail.com",
        teacherPhone: "(303) 555-0606",
        schoolAddress: "890 Pine Ridge Road",
        schoolCity: "Denver",
        schoolState: "CO",
        schoolZip: "80201",
        gradeLevel: "3,4,5",
        expectedClassSize: 12,
        startMonth: "September",
        specialConsiderations: "Small mountain classroom with focus on nature-based learning",
        status: "COLLECTING",
        region: "Mountain",
        isActive: true
      }
    });

    console.log('Schools created with dashboard tokens, creating students...');

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
      "Mountain biking",
      "Rock climbing",
      "Photography",
      null, null, null // 30% have otherInterests, 70% don't
    ];

    const gradeOptions = ["3", "4", "5"];
    const firstNames = ["Emma", "Liam", "Sophia", "Noah", "Ava", "Mason", "Isabella", "Ethan", "Mia", "Alexander", "Charlotte", "William", "Grace", "James", "Lily", "Owen", "Zoe", "Caleb", "Olivia", "Lucas", "Amelia", "Benjamin", "Harper", "Henry", "Evelyn", "Sebastian", "Abigail", "Jackson", "Emily", "Logan", "Aria", "Carter", "Chloe", "Wyatt", "Layla", "Luke", "Riley", "Jack", "Zoey", "Daniel"];
    
    const lastInitials = ["W", "R", "K", "C", "T", "D", "G", "B", "J", "L", "M", "Ta", "P", "Mi", "Co", "Tu", "A", "Mo", "An", "Wh", "H", "Cl", "Le", "Wa", "Ha", "Y", "Ki", "Wr", "Lo", "Hi", "Gr", "Ba", "N", "Ca", "Ro", "Ph", "E", "Tur", "Pa", "Col"];

    // Helper function to generate realistic student data with complete profiles
    const generateStudent = (schoolId: string, index: number) => {
      const firstName = firstNames[index % firstNames.length];
      const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)];
      const grade = gradeOptions[Math.floor(Math.random() * gradeOptions.length)];
      
      // Generate 1-3 interests (all students have interests)
      const numInterests = Math.floor(Math.random() * 3) + 1;
      const shuffledInterests = [...interestOptions].sort(() => 0.5 - Math.random());
      const interests = shuffledInterests.slice(0, numInterests);
      
      // 25% MULTIPLE preference, 75% ONE preference (realistic distribution)
      const penpalPreference = Math.random() < 0.25 ? "MULTIPLE" : "ONE";
      
      // 30% chance of having otherInterests
      const otherInterests = otherInterestsOptions[Math.floor(Math.random() * otherInterestsOptions.length)];
      
      return {
        firstName,
        lastInitial,
        grade,
        interests,
        otherInterests,
        parentConsent: true,
        penpalPreference: penpalPreference as "ONE" | "MULTIPLE",
        isActive: true,
        profileCompleted: true, // All students have complete profiles
        schoolId
      };
    };

    // Create Lincoln Elementary students (10 students - all complete)
    console.log('Creating Lincoln Elementary students...');
    for (let i = 0; i < 10; i++) {
      const studentData = generateStudent(lincolnSchool.id, i);
      await prisma.student.create({ data: studentData });
    }

    // Create Pacific students (20 students - all complete)
    console.log('Creating Pacific Elementary students...');
    for (let i = 0; i < 20; i++) {
      const studentData = generateStudent(pacificSchool.id, i + 10);
      await prisma.student.create({ data: studentData });
    }

    // Create Northeast students (23 students - all complete)
    console.log('Creating Northeast Academy students...');
    for (let i = 0; i < 23; i++) {
      const studentData = generateStudent(northeastSchool.id, i + 30);
      await prisma.student.create({ data: studentData });
    }

    // Create Southwest students (30 students - all complete)
    console.log('Creating Desert View Elementary students...');
    for (let i = 0; i < 30; i++) {
      const studentData = generateStudent(southwestSchool.id, i + 53);
      await prisma.student.create({ data: studentData });
    }

    // Create Midwest students (23 students - all complete)
    console.log('Creating Prairie View Middle School students...');
    for (let i = 0; i < 23; i++) {
      const studentData = generateStudent(midwestSchool.id, i + 83);
      await prisma.student.create({ data: studentData });
    }

    // Create Southeast students (20 students - all complete)
    console.log('Creating Magnolia Elementary students...');
    for (let i = 0; i < 20; i++) {
      const studentData = generateStudent(southeastSchool.id, i + 106);
      await prisma.student.create({ data: studentData });
    }

    // Create Mountain View students (12 students - all complete)
    console.log('Creating Mountain View Elementary students...');
    for (let i = 0; i < 12; i++) {
      const studentData = generateStudent(mountainViewSchool.id, i + 126);
      await prisma.student.create({ data: studentData });
    }

    const totalStudents = 10 + 20 + 23 + 30 + 23 + 20 + 12;

    // === VERIFICATION SECTION ===
    console.log('=== VERIFICATION ===');
    const schoolCount = await prisma.school.count();
    console.log('Total schools in database after seed:', schoolCount);

    const schoolNames = await prisma.school.findMany({
      select: { schoolName: true, status: true, region: true }
    });
    console.log('Schools found:', schoolNames);

    const studentCount = await prisma.student.count();
    console.log('Total students in database after seed:', studentCount);
    
    console.log('Enhanced seed data creation completed successfully');
    console.log(`Created ${totalStudents} students across 7 schools with complete profiles`);

    // Get the created schools with their tokens for the response
    const createdSchools = await prisma.school.findMany({
      where: {
        teacherEmail: {
          in: [
            "jonas.rideout@gmail.com",
            "sarah.johnson@pacific.edu",
            "michael.chen@northeast.edu", 
            "maria.rodriguez@desertview.edu",
            "jennifer.williams@prairieview.edu",
            "robert.davis@magnolia.edu",
            "rightbackatyou13@gmail.com"
          ]
        }
      },
      select: {
        schoolName: true,
        teacherEmail: true,
        dashboardToken: true,
        status: true
      }
    });

    return NextResponse.json({
      message: 'Test data created successfully - all students have complete profiles',
      verification: {
        schoolsInDatabase: schoolCount,
        studentsInDatabase: studentCount,
        schoolsFound: schoolNames
      },
      schools: 7,
      schoolDetails: {
        lincolnElementary: { students: 10, status: "COLLECTING", complete: 10 },
        pacificElementary: { students: 20, status: "READY", complete: 20 },
        northeastAcademy: { students: 23, status: "READY", complete: 23 },
        desertViewElementary: { students: 30, status: "COLLECTING", complete: 30 },
        prairieViewMiddle: { students: 23, status: "COLLECTING", complete: 23 },
        magnoliaElementary: { students: 20, status: "COLLECTING", complete: 20 },
        mountainViewElementary: { students: 12, status: "COLLECTING", complete: 12 }
      },
      totalStudents,
      dashboardTokens: createdSchools.map(school => ({
        schoolName: school.schoolName,
        teacherEmail: school.teacherEmail,
        dashboardToken: school.dashboardToken,
        dashboardUrl: `/dashboard?token=${school.dashboardToken}`,
        status: school.status
      })),
      dataModel: [
        "All students have complete profiles (profileCompleted = true)",
        "All students have interests (1-3 from predefined list)",
        "All students have valid grades (3, 4, or 5)",
        "All students have parent consent",
        "No incomplete students in seed data"
      ],
      testScenarios: [
        "Lincoln Elementary: 10 students, COLLECTING status (jonas.rideout@gmail.com)",
        "Two schools READY for matching (Pacific + Northeast)",
        "Five schools COLLECTING information (Lincoln, Southwest, Midwest, Southeast, Mountain)",
        "Various student counts: 10, 20, 23, 30, 23, 20, 12",
        "All students registered = all students ready",
        "Simplified metrics: registered count = ready count"
      ]
    });

  } catch (error) {
    console.error('Enhanced seed data creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create test data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

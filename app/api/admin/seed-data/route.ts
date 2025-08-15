import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INTEREST_OPTIONS = [
  'sports', 'arts', 'reading', 'technology', 'animals', 'entertainment',
  'social', 'academic', 'hobbies', 'outdoors', 'music', 'fashion'
];

const STATES_TO_REGIONS = {
  // Northeast
  'ME': 'Northeast', 'NH': 'Northeast', 'VT': 'Northeast', 'MA': 'Northeast', 
  'RI': 'Northeast', 'CT': 'Northeast', 'NY': 'Northeast', 'NJ': 'Northeast', 
  'PA': 'Northeast', 'DC': 'Northeast',
  
  // Southeast  
  'DE': 'Southeast', 'MD': 'Southeast', 'VA': 'Southeast', 'WV': 'Southeast',
  'KY': 'Southeast', 'TN': 'Southeast', 'NC': 'Southeast', 'SC': 'Southeast',
  'GA': 'Southeast', 'FL': 'Southeast', 'AL': 'Southeast', 'MS': 'Southeast',
  
  // Midwest
  'OH': 'Midwest', 'IN': 'Midwest', 'IL': 'Midwest', 'MI': 'Midwest',
  'WI': 'Midwest', 'MN': 'Midwest', 'IA': 'Midwest', 'MO': 'Midwest',
  'ND': 'Midwest', 'SD': 'Midwest', 'NE': 'Midwest', 'KS': 'Midwest',
  
  // Southwest
  'TX': 'Southwest', 'OK': 'Southwest', 'AR': 'Southwest', 'LA': 'Southwest',
  'NM': 'Southwest', 'AZ': 'Southwest',
  
  // Mountain West
  'MT': 'Mountain West', 'WY': 'Mountain West', 'CO': 'Mountain West', 
  'UT': 'Mountain West', 'ID': 'Mountain West', 'NV': 'Mountain West',
  
  // Pacific
  'WA': 'Pacific', 'OR': 'Pacific', 'CA': 'Pacific', 'AK': 'Pacific', 'HI': 'Pacific'
};

function getRandomInterests(count: number = 3): string[] {
  const shuffled = [...INTEREST_OPTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function GET() {
  try {
    // Clear existing data
    await prisma.letter.deleteMany();
    await prisma.studentPenpal.deleteMany();
    await prisma.student.deleteMany();
    await prisma.school.deleteMany();

    // School data with different statuses
    const schoolsData = [
      {
        // COLLECTING status - still gathering students
        teacherFirstName: 'Jennifer',
        teacherLastName: 'Rodriguez',
        teacherEmail: 'jennifer.rodriguez@midwest-elem.edu',
        teacherPhone: '555-0123',
        schoolName: 'Midwest Elementary',
        schoolAddress: '456 Oak Street',
        schoolCity: 'Springfield',
        schoolState: 'IL',
        schoolZip: '62701',
        region: 'Midwest',
        gradeLevel: ['3', '4'],
        expectedClassSize: 25,
        startMonth: 'March',
        letterFrequency: 'Monthly',
        status: 'COLLECTING',
        programAgreement: true,
        parentNotification: true,
        studentCount: 15, // Less than expected
        studentsWithInterests: 10 // Some haven't completed profiles
      },
      {
        // READY status - ready for matching
        teacherFirstName: 'Sarah',
        teacherLastName: 'Johnson',
        teacherEmail: 'sarah.johnson@pacific-elem.edu',
        teacherPhone: '555-0101',
        schoolName: 'Pacific Elementary',
        schoolAddress: '123 Main Street',
        schoolCity: 'San Francisco',
        schoolState: 'CA',
        schoolZip: '94102',
        region: 'Pacific',
        gradeLevel: ['4', '5'],
        expectedClassSize: 20,
        startMonth: 'March',
        letterFrequency: 'Bi-weekly',
        status: 'READY',
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 18,
        studentsWithInterests: 18 // All completed
      },
      {
        // READY status - also ready for matching
        teacherFirstName: 'Michael',
        teacherLastName: 'Chen',
        teacherEmail: 'michael.chen@northeast-academy.edu',
        teacherPhone: '555-0102',
        schoolName: 'Northeast Academy',
        schoolAddress: '789 Elm Avenue',
        schoolCity: 'Boston',
        schoolState: 'MA',
        schoolZip: '02101',
        region: 'Northeast',
        gradeLevel: ['4', '5'],
        expectedClassSize: 22,
        startMonth: 'March',
        letterFrequency: 'Bi-weekly',
        status: 'READY',
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 20,
        studentsWithInterests: 20 // All completed
      },
      {
        // COLLECTING status - still working on setup
        teacherFirstName: 'Carlos',
        teacherLastName: 'Martinez',
        teacherEmail: 'carlos.martinez@southwest-school.edu',
        teacherPhone: '555-0124',
        schoolName: 'Southwest Elementary',
        schoolAddress: '321 Desert Road',
        schoolCity: 'Phoenix',
        schoolState: 'AZ',
        schoolZip: '85001',
        region: 'Southwest',
        gradeLevel: ['3', '4', '5'],
        expectedClassSize: 30,
        startMonth: 'April',
        letterFrequency: 'Monthly',
        status: 'COLLECTING',
        programAgreement: false, // Still working on agreement
        parentNotification: true,
        studentCount: 8, // Way less than expected
        studentsWithInterests: 3 // Very few completed
      },
      {
        // MATCHED status - paired and working together
        teacherFirstName: 'Lisa',
        teacherLastName: 'Thompson',
        teacherEmail: 'lisa.thompson@mountain-elem.edu',
        teacherPhone: '555-0105',
        schoolName: 'Mountain View Elementary',
        schoolAddress: '555 Peak Drive',
        schoolCity: 'Denver',
        schoolState: 'CO',
        schoolZip: '80201',
        region: 'Mountain West',
        gradeLevel: ['4', '5'],
        expectedClassSize: 24,
        startMonth: 'February',
        letterFrequency: 'Bi-weekly',
        status: 'MATCHED',
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 22,
        studentsWithInterests: 22,
        lettersSent: 0 // Just matched, no letters yet
      },
      {
        // CORRESPONDING status - actively exchanging letters
        teacherFirstName: 'Amanda',
        teacherLastName: 'Wilson',
        teacherEmail: 'amanda.wilson@southeast-academy.edu',
        teacherPhone: '555-0106',
        schoolName: 'Southeast Academy',
        schoolAddress: '777 Pine Street',
        schoolCity: 'Atlanta',
        schoolState: 'GA',
        schoolZip: '30301',
        region: 'Southeast',
        gradeLevel: ['4', '5'],
        expectedClassSize: 26,
        startMonth: 'January',
        letterFrequency: 'Weekly',
        status: 'CORRESPONDING',
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 24,
        studentsWithInterests: 24,
        lettersSent: 3 // Multiple rounds of letters
      }
    ];

    const createdSchools = [];

    // Create schools and students
    for (const schoolData of schoolsData) {
      const { studentCount, studentsWithInterests, lettersSent, ...schoolFields } = schoolData;
      
      const school = await prisma.school.create({
        data: {
          ...schoolFields,
          lettersSent: lettersSent || 0
        }
      });

      createdSchools.push(school);

      // Create students for this school
      for (let i = 0; i < studentCount; i++) {
        const firstName = getRandomFromArray([
          'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
          'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia'
        ]);
        
        const lastName = getRandomFromArray([
          'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
          'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez'
        ]);

        const hasCompletedProfile = i < studentsWithInterests;
        const interests = hasCompletedProfile ? getRandomInterests() : [];

        await prisma.student.create({
          data: {
            firstName,
            lastName,
            grade: getRandomFromArray(schoolData.gradeLevel),
            interests,
            parentFirstName: getRandomFromArray(['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa']),
            parentLastName: lastName,
            parentEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
            parentPhone: `555-${Math.floor(Math.random() * 9000) + 1000}`,
            parentConsent: true,
            isActive: true,
            profileCompleted: hasCompletedProfile,
            schoolId: school.id
          }
        });
      }
    }

    // Create a school matching relationship (Mountain View <-> Southeast Academy)
    const mountainSchool = createdSchools.find(s => s.schoolName === 'Mountain View Elementary');
    const southeastSchool = createdSchools.find(s => s.schoolName === 'Southeast Academy');
    
    if (mountainSchool && southeastSchool) {
      await prisma.school.update({
        where: { id: mountainSchool.id },
        data: { matchedWithSchoolId: southeastSchool.id }
      });
      
      await prisma.school.update({
        where: { id: southeastSchool.id },
        data: { matchedWithSchoolId: mountainSchool.id }
      });
    }

    // Get final counts for response
    const schoolCounts = await prisma.school.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const totalStudents = await prisma.student.count();
    const studentsWithCompletedProfiles = await prisma.student.count({
      where: { profileCompleted: true }
    });

    const response = {
      message: 'Seed data created successfully!',
      schools: createdSchools.length,
      students: totalStudents,
      studentsWithProfiles: studentsWithCompletedProfiles,
      schoolsByStatus: schoolCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {} as Record<string, number>),
      testUrls: {
        collectingSchools: [
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=jennifer.rodriguez@midwest-elem.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=carlos.martinez@southwest-school.edu'
        ],
        readySchools: [
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=sarah.johnson@pacific-elem.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=michael.chen@northeast-academy.edu'
        ],
        matchedSchool: 'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=lisa.thompson@mountain-elem.edu',
        correspondingSchool: 'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=amanda.wilson@southeast-academy.edu',
        adminDashboard: 'https://nextjs-boilerplate-beta-three-49.vercel.app/admin/matching'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Seed data creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create seed data', details: error },
      { status: 500 }
    );
  }
}

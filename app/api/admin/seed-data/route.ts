import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SchoolStatus } from '@prisma/client';

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

    // Enhanced school data with more schools and better distribution
    const schoolsData = [
      // COLLECTING STATUS (3 schools)
      {
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
        status: 'COLLECTING' as SchoolStatus,
        programAgreement: true,
        parentNotification: true,
        studentCount: 15,
        studentsWithInterests: 10
      },
      {
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
        status: 'COLLECTING' as SchoolStatus,
        programAgreement: false,
        parentNotification: true,
        studentCount: 8,
        studentsWithInterests: 3
      },
      {
        teacherFirstName: 'Rebecca',
        teacherLastName: 'Taylor',
        teacherEmail: 'rebecca.taylor@mountain-prep.edu',
        teacherPhone: '555-0125',
        schoolName: 'Mountain Prep Academy',
        schoolAddress: '890 Alpine Way',
        schoolCity: 'Salt Lake City',
        schoolState: 'UT',
        schoolZip: '84101',
        region: 'Mountain West',
        gradeLevel: ['4', '5', '6'],
        expectedClassSize: 28,
        startMonth: 'February',
        letterFrequency: 'Bi-weekly',
        status: 'COLLECTING' as SchoolStatus,
        programAgreement: true,
        parentNotification: false, // Still working on notification
        studentCount: 12,
        studentsWithInterests: 8
      },

      // READY STATUS (6 schools - good for matching tests)
      {
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
        status: 'READY' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 18,
        studentsWithInterests: 18
      },
      {
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
        status: 'READY' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 20,
        studentsWithInterests: 20
      },
      {
        teacherFirstName: 'David',
        teacherLastName: 'Walker',
        teacherEmail: 'david.walker@texas-central.edu',
        teacherPhone: '555-0127',
        schoolName: 'Texas Central School',
        schoolAddress: '567 Lone Star Blvd',
        schoolCity: 'Austin',
        schoolState: 'TX',
        schoolZip: '73301',
        region: 'Southwest',
        gradeLevel: ['3', '4'],
        expectedClassSize: 24,
        startMonth: 'March',
        letterFrequency: 'Monthly',
        status: 'READY' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 22,
        studentsWithInterests: 22
      },
      {
        teacherFirstName: 'Patricia',
        teacherLastName: 'Anderson',
        teacherEmail: 'patricia.anderson@florida-coast.edu',
        teacherPhone: '555-0128',
        schoolName: 'Florida Coast Elementary',
        schoolAddress: '234 Ocean Drive',
        schoolCity: 'Miami',
        schoolState: 'FL',
        schoolZip: '33101',
        region: 'Southeast',
        gradeLevel: ['4', '5'],
        expectedClassSize: 26,
        startMonth: 'February',
        letterFrequency: 'Bi-weekly',
        status: 'READY' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 24,
        studentsWithInterests: 24
      },
      {
        teacherFirstName: 'Robert',
        teacherLastName: 'Miller',
        teacherEmail: 'robert.miller@prairie-winds.edu',
        teacherPhone: '555-0129',
        schoolName: 'Prairie Winds School',
        schoolAddress: '345 Wheat Field Road',
        schoolCity: 'Omaha',
        schoolState: 'NE',
        schoolZip: '68101',
        region: 'Midwest',
        gradeLevel: ['3', '4', '5'],
        expectedClassSize: 30,
        startMonth: 'March',
        letterFrequency: 'Monthly',
        status: 'READY' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 28,
        studentsWithInterests: 28
      },
      {
        teacherFirstName: 'Linda',
        teacherLastName: 'Garcia',
        teacherEmail: 'linda.garcia@washington-hills.edu',
        teacherPhone: '555-0130',
        schoolName: 'Washington Hills Elementary',
        schoolAddress: '678 Cedar Avenue',
        schoolCity: 'Seattle',
        schoolState: 'WA',
        schoolZip: '98101',
        region: 'Pacific',
        gradeLevel: ['4', '5', '6'],
        expectedClassSize: 32,
        startMonth: 'February',
        letterFrequency: 'Bi-weekly',
        status: 'READY' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 30,
        studentsWithInterests: 30
      },

      // MATCHED STATUS (2 schools - 1 pair)
      {
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
        status: 'MATCHED' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 22,
        studentsWithInterests: 22,
        lettersSent: 0
      },
      {
        teacherFirstName: 'James',
        teacherLastName: 'Williams',
        teacherEmail: 'james.williams@liberty-school.edu',
        teacherPhone: '555-0131',
        schoolName: 'Liberty Elementary School',
        schoolAddress: '432 Freedom Street',
        schoolCity: 'Philadelphia',
        schoolState: 'PA',
        schoolZip: '19101',
        region: 'Northeast',
        gradeLevel: ['4', '5'],
        expectedClassSize: 26,
        startMonth: 'February',
        letterFrequency: 'Bi-weekly',
        status: 'MATCHED' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 24,
        studentsWithInterests: 24,
        lettersSent: 0
      },

      // CORRESPONDING STATUS (2 schools - 1 pair)
      {
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
        status: 'CORRESPONDING' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 24,
        studentsWithInterests: 24,
        lettersSent: 3
      },
      {
        teacherFirstName: 'Thomas',
        teacherLastName: 'Davis',
        teacherEmail: 'thomas.davis@rocky-mountain.edu',
        teacherPhone: '555-0132',
        schoolName: 'Rocky Mountain Academy',
        schoolAddress: '123 Summit Drive',
        schoolCity: 'Bozeman',
        schoolState: 'MT',
        schoolZip: '59715',
        region: 'Mountain West',
        gradeLevel: ['4', '5'],
        expectedClassSize: 20,
        startMonth: 'January',
        letterFrequency: 'Weekly',
        status: 'CORRESPONDING' as SchoolStatus,
        readyForMatching: true,
        programAgreement: true,
        parentNotification: true,
        studentCount: 18,
        studentsWithInterests: 18,
        lettersSent: 4
      }
    ];

    const createdSchools = [];

    // Create schools and students
    for (const schoolData of schoolsData) {
      const { studentCount, studentsWithInterests, lettersSent, ...schoolFields } = schoolData;
      
      const school = await prisma.school.create({
        data: {
          ...schoolFields,
          lettersSent: lettersSent || 0,
          lettersReceived: lettersSent || 0 // Set received to same as sent for simplicity
        }
      });

      createdSchools.push(school);

      // Create students for this school
      for (let i = 0; i < studentCount; i++) {
        const firstName = getRandomFromArray([
          'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
          'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
          'Harper', 'Jacob', 'Evelyn', 'Lucas', 'Abigail', 'Henry', 'Emily', 'Alexander',
          'Elizabeth', 'Michael', 'Sofia', 'Daniel', 'Avery', 'Matthew', 'Ella'
        ]);
        
        const lastName = getRandomFromArray([
          'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
          'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
          'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
        ]);

        const hasCompletedProfile = i < studentsWithInterests;
        const interests = hasCompletedProfile ? getRandomInterests() : [];

        await prisma.student.create({
          data: {
            firstName,
            lastName,
            grade: getRandomFromArray(schoolData.gradeLevel),
            interests,
            parentFirstName: getRandomFromArray(['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Amy', 'Mark', 'Jessica']),
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

    // Create school matching relationships
    // Mountain View Elementary <-> Liberty Elementary School (MATCHED pair)
    const mountainSchool = createdSchools.find(s => s.schoolName === 'Mountain View Elementary');
    const libertySchool = createdSchools.find(s => s.schoolName === 'Liberty Elementary School');
    
    if (mountainSchool && libertySchool) {
      await prisma.school.update({
        where: { id: mountainSchool.id },
        data: { matchedWithSchoolId: libertySchool.id }
      });
      
      await prisma.school.update({
        where: { id: libertySchool.id },
        data: { matchedWithSchoolId: mountainSchool.id }
      });
    }

    // Southeast Academy <-> Rocky Mountain Academy (CORRESPONDING pair)
    const southeastSchool = createdSchools.find(s => s.schoolName === 'Southeast Academy');
    const rockyMountainSchool = createdSchools.find(s => s.schoolName === 'Rocky Mountain Academy');
    
    if (southeastSchool && rockyMountainSchool) {
      await prisma.school.update({
        where: { id: southeastSchool.id },
        data: { matchedWithSchoolId: rockyMountainSchool.id }
      });
      
      await prisma.school.update({
        where: { id: rockyMountainSchool.id },
        data: { matchedWithSchoolId: southeastSchool.id }
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
      message: 'Enhanced seed data created successfully!',
      schools: createdSchools.length,
      students: totalStudents,
      studentsWithProfiles: studentsWithCompletedProfiles,
      schoolsByStatus: schoolCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {} as Record<string, number>),
      readySchoolsForMatching: createdSchools
        .filter(s => s.status === 'READY')
        .map(s => ({ name: s.schoolName, region: s.region, email: s.teacherEmail })),
      testUrls: {
        collectingSchools: [
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=jennifer.rodriguez@midwest-elem.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=carlos.martinez@southwest-school.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=rebecca.taylor@mountain-prep.edu'
        ],
        readySchools: [
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=sarah.johnson@pacific-elem.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=michael.chen@northeast-academy.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=david.walker@texas-central.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=patricia.anderson@florida-coast.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=robert.miller@prairie-winds.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=linda.garcia@washington-hills.edu'
        ],
        matchedSchools: [
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=lisa.thompson@mountain-elem.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=james.williams@liberty-school.edu'
        ],
        correspondingSchools: [
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=amanda.wilson@southeast-academy.edu',
          'https://nextjs-boilerplate-beta-three-49.vercel.app/dashboard?teacher=thomas.davis@rocky-mountain.edu'
        ],
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

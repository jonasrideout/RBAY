import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SAMPLE_INTERESTS = [
  ['sports', 'reading', 'outdoors'],
  ['arts', 'music', 'reading'],
  ['technology', 'academic', 'hobbies'],
  ['animals', 'outdoors', 'social'],
  ['entertainment', 'social', 'fashion'],
  ['reading', 'academic', 'music'],
  ['sports', 'social', 'outdoors'],
  ['arts', 'hobbies', 'animals'],
  ['technology', 'entertainment', 'reading'],
  ['music', 'fashion', 'social']
];

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Daniel', 'Elizabeth', 'Jacob', 'Sofia', 'Logan', 'Avery', 'Jackson'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

const OTHER_INTERESTS = [
  'Loves building with Legos and reading mystery books',
  'Enjoys cooking with family and playing board games',
  'Interested in space exploration and astronomy',
  'Likes drawing cartoons and watching anime',
  'Enjoys hiking and collecting rocks',
  'Loves playing chess and solving puzzles',
  'Interested in photography and nature',
  'Enjoys swimming and water sports'
];

export async function POST(request: NextRequest) {
  try {
    // Clear existing data first
    await prisma.student.deleteMany({});
    await prisma.school.deleteMany({});

    const schools: any[] = [];
    const students: any[] = [];

    // School 1: Pacific Elementary (Ready for Matching)
    const pacificSchool = await prisma.school.create({
      data: {
        teacherFirstName: 'Sarah',
        teacherLastName: 'Johnson',
        teacherEmail: 'sarah.johnson@pacific-elem.edu',
        teacherPhone: '(555) 123-4567',
        schoolName: 'Pacific Elementary',
        schoolAddress: '123 Ocean View Drive, San Francisco, CA 94102',
        schoolState: 'CA',
        region: 'Pacific',
        gradeLevels: ['4', '5'],
        classSize: 10,
        programStartMonth: 'March',
        letterFrequency: 'bi-weekly',
        specialConsiderations: 'We have two students with learning accommodations',
        programAgreement: true,
        parentNotification: true,
        readyForMatching: true
      }
    });
    schools.push(pacificSchool);

    // Create 10 students for Pacific Elementary (all with interests)
    for (let i = 0; i < 10; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const grade = Math.random() > 0.5 ? '4' : '5';
      const interests = SAMPLE_INTERESTS[i % SAMPLE_INTERESTS.length];
      const otherInterests = i % 3 === 0 ? OTHER_INTERESTS[Math.floor(Math.random() * OTHER_INTERESTS.length)] : null;

      const student = await prisma.student.create({
        data: {
          firstName,
          lastName,
          grade,
          interests,
          otherInterests,
          parentName: `${firstName} Parent`,
          parentEmail: `${firstName.toLowerCase()}.parent@email.com`,
          parentConsent: true,
          isActive: true,
          schoolId: pacificSchool.id
        }
      });
      students.push(student);
    }

    // School 2: Northeast Academy (Ready for Matching)
    const northeastSchool = await prisma.school.create({
      data: {
        teacherFirstName: 'Michael',
        teacherLastName: 'Chen',
        teacherEmail: 'michael.chen@northeast-academy.edu',
        teacherPhone: '(555) 234-5678',
        schoolName: 'Northeast Academy',
        schoolAddress: '456 Maple Street, Boston, MA 02101',
        schoolState: 'MA',
        region: 'Northeast',
        gradeLevels: ['4', '5'],
        classSize: 12,
        programStartMonth: 'March',
        letterFrequency: 'bi-weekly',
        specialConsiderations: 'Our class loves creative writing projects',
        programAgreement: true,
        parentNotification: true,
        readyForMatching: true
      }
    });
    schools.push(northeastSchool);

    // Create 12 students for Northeast Academy (all with interests)
    for (let i = 0; i < 12; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const grade = Math.random() > 0.4 ? '4' : '5';
      const interests = SAMPLE_INTERESTS[i % SAMPLE_INTERESTS.length];
      const otherInterests = i % 4 === 0 ? OTHER_INTERESTS[Math.floor(Math.random() * OTHER_INTERESTS.length)] : null;

      const student = await prisma.student.create({
        data: {
          firstName,
          lastName,
          grade,
          interests,
          otherInterests,
          parentName: `${firstName} Guardian`,
          parentEmail: `${firstName.toLowerCase()}.guardian@email.com`,
          parentConsent: true,
          isActive: true,
          schoolId: northeastSchool.id
        }
      });
      students.push(student);
    }

    // School 3: Midwest Elementary (In Progress - Some students need interests)
    const midwestSchool = await prisma.school.create({
      data: {
        teacherFirstName: 'Jennifer',
        teacherLastName: 'Rodriguez',
        teacherEmail: 'jennifer.rodriguez@midwest-elem.edu',
        teacherPhone: '(555) 345-6789',
        schoolName: 'Midwest Elementary',
        schoolAddress: '789 Prairie Road, Chicago, IL 60601',
        schoolState: 'IL',
        region: 'Midwest',
        gradeLevels: ['3', '4'],
        classSize: 8,
        programStartMonth: 'April',
        letterFrequency: 'weekly',
        specialConsiderations: 'We prefer shorter letter exchanges to start',
        programAgreement: true,
        parentNotification: true,
        readyForMatching: false
      }
    });
    schools.push(midwestSchool);

    // Create 8 students for Midwest Elementary (only half have interests)
    for (let i = 0; i < 8; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const grade = Math.random() > 0.6 ? '3' : '4';
      const hasInterests = i < 4; // First 4 have interests, last 4 don't
      const interests = hasInterests ? SAMPLE_INTERESTS[i % SAMPLE_INTERESTS.length] : [];
      const otherInterests = hasInterests && i % 2 === 0 ? OTHER_INTERESTS[Math.floor(Math.random() * OTHER_INTERESTS.length)] : null;

      const student = await prisma.student.create({
        data: {
          firstName,
          lastName,
          grade,
          interests,
          otherInterests,
          parentName: `${firstName} Parent`,
          parentEmail: `${firstName.toLowerCase()}.parent@email.com`,
          parentConsent: true,
          isActive: true,
          schoolId: midwestSchool.id
        }
      });
      students.push(student);
    }

    // School 4: Southwest School (Just Started - No one ready)
    const southwestSchool = await prisma.school.create({
      data: {
        teacherFirstName: 'Carlos',
        teacherLastName: 'Martinez',
        teacherEmail: 'carlos.martinez@southwest-school.edu',
        teacherPhone: '(555) 456-7890',
        schoolName: 'Southwest Elementary',
        schoolAddress: '321 Desert View Lane, Austin, TX 78701',
        schoolState: 'TX',
        region: 'Southwest',
        gradeLevels: ['5', '6'],
        classSize: 6,
        programStartMonth: 'May',
        letterFrequency: 'monthly',
        specialConsiderations: 'New to the program, excited to get started',
        programAgreement: true,
        parentNotification: true,
        readyForMatching: false
      }
    });
    schools.push(southwestSchool);

    // Create 6 students for Southwest School (none have interests yet)
    for (let i = 0; i < 6; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const grade = Math.random() > 0.5 ? '5' : '6';

      const student = await prisma.student.create({
        data: {
          firstName,
          lastName,
          grade,
          interests: [], // No interests yet
          otherInterests: null,
          parentName: `${firstName} Parent`,
          parentEmail: `${firstName.toLowerCase()}.parent@email.com`,
          parentConsent: true,
          isActive: true,
          schoolId: southwestSchool.id
        }
      });
      students.push(student);
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully!',
      summary: {
        schoolsCreated: schools.length,
        studentsCreated: students.length,
        readyForMatching: schools.filter(s => s.readyForMatching).length
      },
      schools: schools.map(school => ({
        name: school.schoolName,
        teacher: `${school.teacherFirstName} ${school.teacherLastName}`,
        email: school.teacherEmail,
        region: school.region,
        students: students.filter(s => s.schoolId === school.id).length,
        readyForMatching: school.readyForMatching,
        dashboardUrl: `/dashboard?teacher=${encodeURIComponent(school.teacherEmail)}`
      })),
      testUrls: {
        adminMatching: '/admin/matching',
        pacificDashboard: `/dashboard?teacher=${encodeURIComponent('sarah.johnson@pacific-elem.edu')}`,
        northeastDashboard: `/dashboard?teacher=${encodeURIComponent('michael.chen@northeast-academy.edu')}`,
        midwestDashboard: `/dashboard?teacher=${encodeURIComponent('jennifer.rodriguez@midwest-elem.edu')}`,
        southwestDashboard: `/dashboard?teacher=${encodeURIComponent('carlos.martinez@southwest-school.edu')}`
      }
    });

  } catch (error: any) {
    console.error('Seed data error:', error);
    return NextResponse.json(
      { error: 'Failed to create test data: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to create test data',
    description: 'This endpoint creates 4 test schools with realistic student data for testing the matching system.',
    usage: 'POST to this endpoint to generate test data'
  });
}

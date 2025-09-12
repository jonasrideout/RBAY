// /app/api/admin/create-school/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = request.cookies.get('admin-session');
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      schoolName,
      teacherEmail,
      teacherName,
      address,
      city,
      state,
      zipCode,
      phoneNumber,
      gradeLevel,
      notes
    } = body;

    // Minimal validation - only school name and teacher email required
    if (!schoolName || !teacherEmail) {
      return NextResponse.json(
        { error: 'School name and teacher email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if school with this email already exists
    const existingSchool = await prisma.school.findUnique({
      where: { teacherEmail }
    });

    if (existingSchool) {
      return NextResponse.json(
        { error: 'A school with this teacher email already exists' },
        { status: 409 }
      );
    }

    // Determine region from state if provided
    const STATE_TO_REGION: { [key: string]: string } = {
      'AL': 'Southeast', 'AK': 'West', 'AZ': 'West', 'AR': 'South',
      'CA': 'West', 'CO': 'West', 'CT': 'Northeast', 'DE': 'Northeast',
      'FL': 'Southeast', 'GA': 'Southeast', 'HI': 'West', 'ID': 'West',
      'IL': 'Midwest', 'IN': 'Midwest', 'IA': 'Midwest', 'KS': 'Midwest',
      'KY': 'South', 'LA': 'South', 'ME': 'Northeast', 'MD': 'Northeast',
      'MA': 'Northeast', 'MI': 'Midwest', 'MN': 'Midwest', 'MS': 'South',
      'MO': 'Midwest', 'MT': 'West', 'NE': 'Midwest', 'NV': 'West',
      'NH': 'Northeast', 'NJ': 'Northeast', 'NM': 'West', 'NY': 'Northeast',
      'NC': 'Southeast', 'ND': 'Midwest', 'OH': 'Midwest', 'OK': 'South',
      'OR': 'West', 'PA': 'Northeast', 'RI': 'Northeast', 'SC': 'Southeast',
      'SD': 'Midwest', 'TN': 'South', 'TX': 'South', 'UT': 'West',
      'VT': 'Northeast', 'VA': 'Southeast', 'WA': 'West', 'WV': 'Southeast',
      'WI': 'Midwest', 'WY': 'West'
    };

    const region = state ? STATE_TO_REGION[state.toUpperCase()] || 'Unknown' : 'Unknown';

    // Create the school with admin defaults
    const school = await prisma.school.create({
      data: {
        teacherName: teacherName || '',
        teacherEmail,
        teacherPhone: phoneNumber || null,
        schoolName,
        schoolAddress: address || null,
        schoolCity: city || null,
        schoolState: state ? state.toUpperCase() : null,
        schoolZip: zipCode || null,
        region,
        gradeLevel: gradeLevel || 'Not specified',
        expectedClassSize: 25, // Default class size for admin-created schools
        startMonth: 'TBD', // Teacher can update later
        status: 'COLLECTING',
        specialConsiderations: notes || null,
      }
    });

    // Generate links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dashboardLink = `${baseUrl}/dashboard?token=${school.dashboardToken}`;
    const registrationLink = `${baseUrl}/register-student`;

    // Send welcome email using existing system (non-blocking)
    let emailSent = false;
    let emailError = '';
    
    try {
      const emailResult = await sendWelcomeEmail({
        teacherName: teacherName || 'Teacher',
        teacherEmail,
        schoolName,
        dashboardToken: school.dashboardToken
      });
      
      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error || 'Unknown email error';
        console.warn('Welcome email failed to send:', emailError);
      }
    } catch (error: any) {
      console.warn('Welcome email sending failed:', error);
      emailError = error.message || 'Email service unavailable';
    }

    return NextResponse.json({
      success: true,
      id: school.id,
      schoolName: school.schoolName,
      teacherName: school.teacherName,
      teacherEmail: school.teacherEmail,
      dashboardToken: school.dashboardToken,
      dashboardLink,
      registrationLink,
      emailSent,
      emailError: emailSent ? undefined : emailError
    }, { status: 201 });

  } catch (error: any) {
    console.error('Admin school creation error:', error);
    
    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A school with this teacher email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create school. Please try again.' },
      { status: 500 }
    );
  }
}

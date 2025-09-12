// /app/api/admin/send-welcome-email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { teacherEmail, teacherName, schoolName, dashboardLink, registrationLink } = body;

    if (!teacherEmail || !dashboardLink || !registrationLink) {
      return NextResponse.json(
        { error: 'Teacher email, dashboard link, and registration link are required' },
        { status: 400 }
      );
    }

    const emailSubject = `Welcome to the Right Back at You Project - ${schoolName}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 10px;">
            Welcome to the Right Back at You Project!
          </h1>
          <p style="color: #4a5568; font-size: 16px;">
            Building empathy and connection through literature
          </p>
        </div>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 15px;">
            Hello${teacherName ? ` ${teacherName}` : ''}!
          </h2>
          <p style="color: #4a5568; margin-bottom: 15px;">
            Your school <strong>${schoolName}</strong> has been successfully registered for the Right Back at You Project. 
            We're excited to have you join this meaningful pen pal exchange program centered around Carolyn Mackler's novel.
          </p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2d3748; font-size: 18px; margin-bottom: 15px;">Your Project Links</h3>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: #4a5568; font-size: 16px; margin-bottom: 8px;">Teacher Dashboard</h4>
            <p style="color: #718096; font-size: 14px; margin-bottom: 8px;">
              Manage your school's participation, view students, and track progress:
            </p>
            <a href="${dashboardLink}" 
               style="display: inline-block; background: #3182ce; color: white; padding: 12px 20px; 
                      text-decoration: none; border-radius: 6px; font-weight: 600;">
              Access Your Dashboard
            </a>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: #4a5568; font-size: 16px; margin-bottom: 8px;">Student Registration</h4>
            <p style="color: #718096; font-size: 14px; margin-bottom: 8px;">
              Share this link with your students so they can register for the project:
            </p>
            <a href="${registrationLink}" 
               style="display: inline-block; background: #38a169; color: white; padding: 12px 20px; 
                      text-decoration: none; border-radius: 6px; font-weight: 600;">
              Student Registration Link
            </a>
          </div>
        </div>
        
        <div style="background: #edf2f7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #2d3748; font-size: 16px; margin-bottom: 12px;">Next Steps:</h3>
          <ol style="color: #4a5568; font-size: 14px; margin-left: 20px;">
            <li style="margin-bottom: 8px;">Log into your teacher dashboard to complete your school profile</li>
            <li style="margin-bottom: 8px;">Share the student registration link with your class</li>
            <li style="margin-bottom: 8px;">Help students complete their profiles and interests</li>
            <li style="margin-bottom: 8px;">We'll match your school with another participating school</li>
            <li>Students will begin their pen pal correspondence!</li>
          </ol>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; color: #718096; font-size: 14px;">
          <p style="margin-bottom: 10px;">
            <strong>Questions or need help?</strong> Reply to this email and we'll be happy to assist you.
          </p>
          <p style="margin-bottom: 0;">
            Thank you for joining the Right Back at You Project. We're looking forward to facilitating 
            meaningful connections between your students and their future pen pals!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #a0aec0; font-size: 12px;">
            © 2024 The Right Back at You Project by Carolyn Mackler
          </p>
        </div>
      </div>
    `;

    const emailText = `
Welcome to the Right Back at You Project!

Hello${teacherName ? ` ${teacherName}` : ''}!

Your school ${schoolName} has been successfully registered for the Right Back at You Project. We're excited to have you join this meaningful pen pal exchange program.

Your Project Links:

Teacher Dashboard: ${dashboardLink}
Manage your school's participation, view students, and track progress.

Student Registration: ${registrationLink}  
Share this link with your students so they can register for the project.

Next Steps:
1. Log into your teacher dashboard to complete your school profile
2. Share the student registration link with your class
3. Help students complete their profiles and interests  
4. We'll match your school with another participating school
5. Students will begin their pen pal correspondence!

Questions or need help? Reply to this email and we'll be happy to assist you.

Thank you for joining the Right Back at You Project!

© 2024 The Right Back at You Project by Carolyn Mackler
    `;

    const result = await resend.emails.send({
      from: 'Right Back at You Project <noreply@rightbackatyou.org>',
      to: [teacherEmail],
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.data?.id
    });

  } catch (error: any) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}

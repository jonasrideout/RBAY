// /lib/email.ts
import { Resend } from 'resend';
import WelcomeEmail from '@/app/components/emails/WelcomeEmail';
import MagicLinkEmail from '@/app/components/emails/MagicLinkEmail';
import { PrismaClient } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendWelcomeEmailParams {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  dashboardToken: string;
}

export interface SendMagicLinkEmailParams {
  teacherEmail: string;
  magicLinkUrl: string;
}

export async function sendWelcomeEmail({
  teacherName,
  teacherEmail,
  schoolName,
  dashboardToken
}: SendWelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
    
    const { data, error } = await resend.emails.send({
      from: 'Right Back at You Project <onboarding@resend.dev>',
      to: [teacherEmail],
      subject: `Welcome to Right Back at You - ${schoolName}`,
      react: WelcomeEmail({
        teacherName,
        schoolName,
        dashboardUrl: `${baseUrl}/dashboard?token=${dashboardToken}`,
        studentRegistrationUrl: `${baseUrl}/register-student?token=${dashboardToken}`
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Welcome email sent successfully:', data);
    return { success: true };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

export async function sendMagicLinkEmail({
  teacherEmail,
  magicLinkUrl
}: SendMagicLinkEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const prisma = new PrismaClient();
    
    // Check if school exists for this teacher
    const school = await prisma.school.findUnique({
      where: {
        teacherEmail: teacherEmail
      }
    });

    await prisma.$disconnect();

    // Determine email type and content
    const isNewUser = !school;
    const teacherName = school?.teacherName || '';

    const subject = isNewUser 
      ? 'Welcome to Right Back at You - Verify Your Email to Get Started'
      : 'Your Right Back at You Dashboard Login Link';

    const { data, error } = await resend.emails.send({
      from: 'Right Back at You Project <onboarding@resend.dev>',
      to: [teacherEmail],
      subject: subject,
      react: MagicLinkEmail({
        teacherEmail,
        teacherName,
        magicLinkUrl,
        isNewUser
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Magic link email sent successfully:', data);
    return { success: true };
  } catch (error: any) {
    console.error('Magic link email error:', error);
    return { success: false, error: error.message || 'Failed to send magic link email' };
  }
}

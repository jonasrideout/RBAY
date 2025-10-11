// /lib/email.ts
import { Resend } from 'resend';
import WelcomeEmail from '@/app/components/emails/WelcomeEmail';
import MagicLinkEmail from '@/app/components/emails/MagicLinkEmail';
import PenPalAssignmentEmail from '@/app/components/emails/PenPalAssignmentEmail';
import { PrismaClient } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendWelcomeEmailParams {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  dashboardToken: string;
  isAdminCreated?: boolean;
}

export interface SendMagicLinkEmailParams {
  teacherEmail: string;
  magicLinkUrl: string;
}

export interface SendPenPalAssignmentEmailParams {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  partnerSchoolNames: string[];
}

export async function sendWelcomeEmail({
  teacherName,
  teacherEmail,
  schoolName,
  dashboardToken,
  isAdminCreated = false
}: SendWelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
    
    const subject = isAdminCreated
      ? `Welcome to The Right Back at You Project - Complete Your School Profile`
      : `Welcome to The Right Back at You Project - ${schoolName}`;
    
    const { data, error } = await resend.emails.send({
      from: 'Right Back at You <noreply@carolynmackler.com>',
      to: [teacherEmail],
      subject: subject,
      react: WelcomeEmail({
        teacherName,
        schoolName,
        dashboardUrl: `${baseUrl}/dashboard?token=${dashboardToken}`,
        studentRegistrationUrl: `${baseUrl}/register-student?token=${dashboardToken}`,
        isAdminCreated
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
    
    const school = await prisma.school.findUnique({
      where: {
        teacherEmail: teacherEmail
      }
    });
    await prisma.$disconnect();

    const isNewUser = !school;
    const teacherName = school?.teacherName || '';
    
    const subject = isNewUser 
      ? 'Welcome to The Right Back at You Project - Verify Your Email to Get Started'
      : 'Your Right Back at You Dashboard Login Link';
    
    const { data, error } = await resend.emails.send({
      from: 'Right Back at You <noreply@carolynmackler.com>',
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

export async function sendPenPalAssignmentEmail({
  teacherName,
  teacherEmail,
  schoolName,
  partnerSchoolNames,
}: SendPenPalAssignmentEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Right Back at You <noreply@carolynmackler.com>',
      to: [teacherEmail],
      subject: 'Your Pen Pal Assignments Are Ready!',
      react: PenPalAssignmentEmail({
        teacherName,
        schoolName,
        partnerSchoolNames,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Pen pal assignment email sent successfully:', data);
    return { success: true };
  } catch (error: any) {
    console.error('Pen pal assignment email error:', error);
    return { success: false, error: error.message || 'Failed to send pen pal assignment email' };
  }
}

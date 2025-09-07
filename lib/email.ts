// /lib/email.ts

import { Resend } from 'resend';
import WelcomeEmail from '@/app/components/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendWelcomeEmailParams {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  dashboardToken: string;
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

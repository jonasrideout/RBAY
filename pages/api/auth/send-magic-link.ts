// /pages/api/auth/send-magic-link.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { generateMagicLinkToken, generateMagicLinkUrl, createMagicLinkEmailTemplate } from '@/lib/magicLink';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if teacher exists in database using Prisma directly
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const school = await prisma.school.findUnique({
        where: {
          teacherEmail: email
        }
      });

      if (!school) {
        await prisma.$disconnect();
        return res.status(404).json({ 
          error: 'No school found for this email address. Please register your school first.',
          needsRegistration: true
        });
      }

      await prisma.$disconnect();
    } catch (dbError) {
      await prisma.$disconnect();
      console.error('Database error checking teacher:', dbError);
      throw new Error('Failed to verify teacher email');
    }

    // Generate magic link token
    const tokenData = generateMagicLinkToken(email);
    
    // Generate magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const magicLinkUrl = generateMagicLinkUrl(baseUrl, tokenData);
    
    // Create email template
    const emailTemplate = createMagicLinkEmailTemplate(magicLinkUrl, email);

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'Right Back at You Project <onboarding@resend.dev>', // Using Resend's sandbox domain
      to: [email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (emailResult.error) {
      console.error('Resend email error:', emailResult.error);
      throw new Error('Failed to send login email');
    }

    console.log('Magic link sent successfully to:', email);

    return res.status(200).json({ 
      success: true, 
      message: 'Login link sent to your email address' 
    });

  } catch (error) {
    console.error('Send magic link error:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: error.message || 'Failed to send login link' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to send login link' 
    });
  }
}

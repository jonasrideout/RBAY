// /pages/api/auth/extend-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTeacherSession, createTeacherSession, setSessionCookie } from '@/lib/magicLink';
import { NextResponse } from 'next/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current session cookie
    const sessionCookie = req.cookies['teacher-session'];
    
    if (!sessionCookie) {
      return res.status(401).json({ error: 'No session found' });
    }

    // Verify current session
    const sessionCheck = verifyTeacherSession(sessionCookie);

    if (!sessionCheck.valid || !sessionCheck.session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Check if session is within extension window (can extend if more than 30 minutes left)
    const now = Date.now();
    const timeUntilExpiry = sessionCheck.session.expires - now;
    const thirtyMinutes = 30 * 60 * 1000;

    if (timeUntilExpiry < thirtyMinutes) {
      return res.status(400).json({ 
        error: 'Session too close to expiry for extension',
        minutesLeft: Math.floor(timeUntilExpiry / (60 * 1000))
      });
    }

    // Verify teacher still exists in database
    const teacherCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/schools?teacherEmail=${encodeURIComponent(sessionCheck.session.email)}`, {
      method: 'GET',
    });

    if (!teacherCheckResponse.ok) {
      return res.status(401).json({ error: 'Teacher account not found' });
    }

    // Create new session with extended expiry (24 hours from now)
    const newSession = createTeacherSession(sessionCheck.session.email);

    // Create a NextResponse to set the new cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Session extended successfully',
      newExpiry: newSession.expires,
      hoursExtended: 24
    });
    
    // Set new session cookie
    setSessionCookie(response, newSession);

    // Convert NextResponse cookies to res.setHeader format for Next.js API routes
    const cookieHeader = response.headers.get('set-cookie');
    if (cookieHeader) {
      res.setHeader('Set-Cookie', cookieHeader);
    }

    console.log('Session extended successfully for:', sessionCheck.session.email);

    return res.status(200).json({
      success: true,
      message: 'Session extended successfully',
      newExpiry: newSession.expires,
      hoursExtended: 24
    });

  } catch (error) {
    console.error('Session extension error:', error);
    return res.status(500).json({ 
      error: 'Failed to extend session' 
    });
  }
}

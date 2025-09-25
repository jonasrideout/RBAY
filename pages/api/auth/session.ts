// /pages/api/auth/session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTeacherSession } from '@/lib/magicLink';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session cookie
    const sessionCookie = req.cookies['teacher-session'];
    
    if (!sessionCookie) {
      return res.status(200).json({
        valid: false,
        session: null,
        needsWarning: false
      });
    }

    // Verify session using our utility function
    const sessionCheck = verifyTeacherSession(sessionCookie);

    if (!sessionCheck.valid || !sessionCheck.session) {
      return res.status(200).json({
        valid: false,
        session: null,
        needsWarning: false
      });
    }

    // Double-check that teacher still exists in database
    const teacherCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/schools?teacherEmail=${encodeURIComponent(sessionCheck.session.email)}`, {
      method: 'GET',
    });

    if (!teacherCheckResponse.ok) {
      console.log('Teacher no longer exists in database:', sessionCheck.session.email);
      return res.status(200).json({
        valid: false,
        session: null,
        needsWarning: false
      });
    }

    // Session is valid and teacher exists
    return res.status(200).json({
      valid: true,
      session: sessionCheck.session,
      needsWarning: sessionCheck.needsWarning || false
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(200).json({
      valid: false,
      session: null,
      needsWarning: false
    });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect('/login?error=' + error);
  }

  if (!code) {
    return res.redirect('/login?error=no_code');
  }

  // Exchange the code for tokens
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: `https://${req.headers.host}/api/auth/callback/google`,
      }),
    });

    const tokens = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
    const user = await userResponse.json();

    // For now, just redirect to dashboard with user info
    res.redirect(`/dashboard?user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/login?error=callback_error');
  }
}

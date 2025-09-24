import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/api/auth/callback')}&` +
    `response_type=code&` +
    `scope=email profile&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(googleAuthUrl);
}

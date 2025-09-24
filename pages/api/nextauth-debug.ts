import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const NextAuth = require('next-auth');
    const GoogleProvider = require('next-auth/providers/google');
    
    res.status(200).json({ 
      message: 'NextAuth package check',
      nextAuthExists: !!NextAuth,
      googleProviderExists: !!GoogleProvider,
      nextAuthType: typeof NextAuth,
      nodeVersion: process.version
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'NextAuth import failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

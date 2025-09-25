import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { nextauth } = req.query;
  
  res.status(200).json({ 
    message: 'Dynamic route test',
    path: nextauth,
    method: req.method,
    fullQuery: req.query
  });
}

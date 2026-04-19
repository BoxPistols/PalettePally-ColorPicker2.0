import type { NextApiRequest, NextApiResponse } from 'next';
import { parseFigmaVariables } from '@/lib/figma/variableMapper';
import { verifyAuth } from '@/lib/firebase/admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyAuth(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const pat = req.headers['x-figma-token'] as string;
  const { fileKey } = req.query;

  if (!pat || !fileKey) {
    return res.status(400).json({ error: 'Missing token or fileKey' });
  }

  try {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/variables/local`,
      {
        headers: { 'X-Figma-Token': pat },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Figma API error: ${response.status} ${text.slice(0, 200)}`,
      });
    }

    const data = await response.json();
    const parsed = parseFigmaVariables(data);

    return res.status(200).json(parsed);
  } catch (err: unknown) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal error',
    });
  }
}

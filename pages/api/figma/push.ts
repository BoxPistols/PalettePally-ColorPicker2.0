import type { NextApiRequest, NextApiResponse } from 'next';
import { buildPushPayload } from '@/lib/figma/variableMapper';
import { hexToFigmaColor } from '@/lib/figma/types';
import { PaletteData } from '@/lib/types/palette';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pat = req.headers['x-figma-token'] as string;
  const { fileKey, paletteData } = req.body as {
    fileKey: string;
    paletteData: PaletteData;
  };

  if (!pat || !fileKey || !paletteData) {
    return res.status(400).json({ error: 'Missing token, fileKey, or paletteData' });
  }

  try {
    const payload = buildPushPayload(paletteData);

    // Step 1: Get existing variables to find/create collections
    const existingRes = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/variables/local`,
      { headers: { 'X-Figma-Token': pat } }
    );

    if (!existingRes.ok) {
      return res.status(existingRes.status).json({
        error: `Figma API error: ${existingRes.status}`,
      });
    }

    const existing = await existingRes.json();
    const existingCollections = existing.meta?.variableCollections ?? {};
    const existingVariables = existing.meta?.variables ?? {};

    // Step 2: Build push request
    for (const col of payload.collections) {
      // Find existing collection or we'll create one
      const existingCol = (Object.values(existingCollections) as { id: string; name: string; modes: { modeId: string; name: string }[] }[]).find(
        c => c.name === col.name
      );

      const figmaPayload: Record<string, unknown> = {};

      if (!existingCol) {
        // Create collection with variables
        figmaPayload.variableCollections = [{ action: 'CREATE', name: col.name }];
      }

      const collectionId = existingCol?.id ?? '';
      const lightModeId = existingCol?.modes.find((m: { name: string }) =>
        m.name.toLowerCase().includes('light')
      )?.modeId ?? existingCol?.modes[0]?.modeId ?? '';
      const darkModeId = existingCol?.modes.find((m: { name: string }) =>
        m.name.toLowerCase().includes('dark')
      )?.modeId ?? existingCol?.modes[1]?.modeId ?? '';

      // Create/update variables
      const variableActions: Record<string, unknown>[] = [];
      const modeValues: Record<string, unknown>[] = [];

      for (const v of col.variables) {
        // Check if variable already exists
        const existingVar = (Object.values(existingVariables) as { id: string; name: string; variableCollectionId: string }[]).find(
          ev => ev.name === v.name && ev.variableCollectionId === collectionId
        );

        if (existingVar) {
          // Update existing
          if (lightModeId && v.light.startsWith('#')) {
            modeValues.push({
              variableId: existingVar.id,
              modeId: lightModeId,
              value: hexToFigmaColor(v.light),
            });
          }
          if (darkModeId && v.dark.startsWith('#')) {
            modeValues.push({
              variableId: existingVar.id,
              modeId: darkModeId,
              value: hexToFigmaColor(v.dark),
            });
          }
        } else if (collectionId && v.light.startsWith('#')) {
          variableActions.push({
            action: 'CREATE',
            name: v.name,
            variableCollectionId: collectionId,
            resolvedType: 'COLOR',
          });
        }
      }

      if (variableActions.length > 0) {
        figmaPayload.variables = variableActions;
      }
      if (modeValues.length > 0) {
        figmaPayload.variableModeValues = modeValues;
      }

      // Push to Figma
      if (Object.keys(figmaPayload).length > 0) {
        const pushRes = await fetch(
          `https://api.figma.com/v1/files/${fileKey}/variables`,
          {
            method: 'POST',
            headers: {
              'X-Figma-Token': pat,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(figmaPayload),
          }
        );

        if (!pushRes.ok) {
          const text = await pushRes.text();
          return res.status(pushRes.status).json({
            error: `Figma push failed for "${col.name}": ${text.slice(0, 200)}`,
          });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal error',
    });
  }
}

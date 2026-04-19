import type { NextApiRequest, NextApiResponse } from 'next';
import { buildPushPayload } from '@/lib/figma/variableMapper';
import { hexToFigmaColor } from '@/lib/figma/types';
import { PaletteData } from '@/lib/types/palette';
import { verifyAuth } from '@/lib/firebase/admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyAuth(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
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
      const tempColId = `:col-${col.name.replace(/\s+/g, '-')}`;
      
      if (!existingCol) {
        // Create collection with modes
        figmaPayload.variableCollections = [{ 
          action: 'CREATE', 
          name: col.name, 
          id: tempColId 
        }];
      }

      const collectionId = existingCol?.id ?? tempColId;
      const lightModeId = existingCol?.modes.find((m: { name: string }) =>
        m.name.toLowerCase().includes('light')
      )?.modeId ?? 'light'; // Default to 'light' for new collection
      const darkModeId = existingCol?.modes.find((m: { name: string }) =>
        m.name.toLowerCase().includes('dark')
      )?.modeId ?? 'dark'; // Default to 'dark' for new collection

      // Create/update variables
      const variableActions: Record<string, unknown>[] = [];
      const modeValues: Record<string, unknown>[] = [];

      for (const v of col.variables) {
        // Check if variable already exists
        const existingVar = (Object.values(existingVariables) as { id: string; name: string; variableCollectionId: string }[]).find(
          ev => ev.name === v.name && ev.variableCollectionId === collectionId
        );

        let variableId = existingVar?.id;

        if (!existingVar) {
          // Create variable
          const tempVarId = `:var-${v.name.replace(/\//g, '-')}`;
          variableActions.push({
            action: 'CREATE',
            name: v.name,
            variableCollectionId: collectionId,
            resolvedType: 'COLOR',
            id: tempVarId,
          });
          variableId = tempVarId;
        }

        // Set/Update values for both modes
        if (v.light.startsWith('#')) {
          modeValues.push({
            variableId,
            modeId: lightModeId,
            value: hexToFigmaColor(v.light),
          });
        }
        if (v.dark.startsWith('#')) {
          modeValues.push({
            variableId,
            modeId: darkModeId,
            value: hexToFigmaColor(v.dark),
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

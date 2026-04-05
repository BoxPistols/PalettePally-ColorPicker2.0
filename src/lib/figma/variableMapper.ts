import { PaletteData } from '@/lib/types/palette';
import { paletteToDTCG } from './dtcg';
import { DTCGToken, DTCGGroup } from '@/lib/types/dtcg';
import {
  FigmaVariablesResponse,
  FigmaColor,
  ParsedVariable,
  hexToFigmaColor,
  figmaColorToHex,
} from './types';

// ── Parse Figma response into flat variable list ──

export function parseFigmaVariables(
  response: FigmaVariablesResponse
): { variables: ParsedVariable[]; collections: string[] } {
  const { variables, variableCollections } = response.meta;
  const result: ParsedVariable[] = [];
  const collectionNames: string[] = [];

  for (const col of Object.values(variableCollections)) {
    collectionNames.push(col.name);
    const lightMode = col.modes.find(m => m.name.toLowerCase().includes('light'));
    const darkMode = col.modes.find(m => m.name.toLowerCase().includes('dark'));
    const lightModeId = lightMode?.modeId ?? col.modes[0]?.modeId;
    const darkModeId = darkMode?.modeId ?? col.modes[1]?.modeId ?? lightModeId;

    for (const varId of col.variableIds) {
      const v = variables[varId];
      if (!v || v.resolvedType !== 'COLOR') continue;

      const lightVal = v.valuesByMode[lightModeId ?? ''];
      const darkVal = v.valuesByMode[darkModeId ?? ''];

      result.push({
        collection: col.name,
        name: v.name,
        lightValue: lightVal && typeof lightVal === 'object' && 'r' in lightVal
          ? figmaColorToHex(lightVal as FigmaColor)
          : '#000000',
        darkValue: darkVal && typeof darkVal === 'object' && 'r' in darkVal
          ? figmaColorToHex(darkVal as FigmaColor)
          : '#000000',
      });
    }
  }

  return { variables: result, collections: collectionNames };
}

// ── Build Figma push payload from palette data ──
// Returns operations array for the Figma Variables REST API

type PushOperation = {
  collections: { name: string; variables: { name: string; light: string; dark: string }[] }[];
};

export function buildPushPayload(paletteData: PaletteData): PushOperation {
  const dtcg = paletteToDTCG(paletteData);
  const collections: PushOperation['collections'] = [];

  for (const [collectionName, group] of Object.entries(dtcg)) {
    const variables: { name: string; light: string; dark: string }[] = [];
    const lightGroup = (group as DTCGGroup)['light'] as DTCGGroup | undefined;
    const darkGroup = (group as DTCGGroup)['dark'] as DTCGGroup | undefined;

    if (!lightGroup || !darkGroup) continue;

    // Flatten nested groups into path-based names (e.g., "primary/main")
    const flatten = (
      g: DTCGGroup,
      prefix: string
    ): { path: string; value: string }[] => {
      const items: { path: string; value: string }[] = [];
      for (const [key, val] of Object.entries(g)) {
        if (key.startsWith('$')) continue;
        if (val && typeof val === 'object' && '$value' in val) {
          items.push({ path: prefix ? `${prefix}/${key}` : key, value: (val as DTCGToken).$value });
        } else if (val && typeof val === 'object') {
          items.push(...flatten(val as DTCGGroup, prefix ? `${prefix}/${key}` : key));
        }
      }
      return items;
    };

    const lightItems = flatten(lightGroup, '');
    const darkItems = flatten(darkGroup, '');

    // Match by path
    const darkMap = new Map(darkItems.map(d => [d.path, d.value]));
    for (const item of lightItems) {
      variables.push({
        name: item.path,
        light: item.value,
        dark: darkMap.get(item.path) ?? item.value,
      });
    }

    collections.push({ name: collectionName, variables });
  }

  return { collections };
}

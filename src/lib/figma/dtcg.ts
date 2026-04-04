import { PaletteData } from '@/lib/types/palette';
import { DTCGFile, DTCGGroup, DTCGToken } from '@/lib/types/dtcg';
import { MuiColorVariant } from '@/components/colorUtils';

const colorToken = (value: string, description?: string): DTCGToken => ({
  $value: value,
  $type: 'color',
  ...(description ? { $description: description } : {}),
});

// ── Export: PaletteData → DTCG ──

export function paletteToDTCG(data: PaletteData): DTCGFile {
  const result: DTCGFile = {};

  // Action colors (per-color palette)
  if (data.palette) {
    const actionColors: DTCGGroup = {
      $description: 'MUI action color palettes',
    };

    for (const entry of data.palette) {
      const [name, palette] = Object.entries(entry)[0];
      if (!palette) continue;

      const group: DTCGGroup = {};
      for (const mode of ['light', 'dark'] as const) {
        const variant = palette[mode];
        const modeGroup: DTCGGroup = {};
        for (const [shade, value] of Object.entries(variant)) {
          modeGroup[shade] = colorToken(value);
        }
        group[mode] = modeGroup;
      }
      actionColors[name] = group;
    }

    result['action-colors'] = actionColors;
  }

  // Grey scale
  if (data.themeTokens?.grey) {
    const grey: DTCGGroup = {
      $description: 'Grey scale derived from primary',
    };
    for (const mode of ['light', 'dark'] as const) {
      const modeGroup: DTCGGroup = {};
      for (const [shade, value] of Object.entries(data.themeTokens.grey[mode])) {
        modeGroup[shade] = colorToken(value);
      }
      grey[mode] = modeGroup;
    }
    result['grey'] = grey;
  }

  // Utility tokens
  if (data.themeTokens?.utility) {
    const utility: DTCGGroup = {
      $description: 'Utility tokens (text, background, surface, action, divider, common)',
    };
    for (const mode of ['light', 'dark'] as const) {
      const modeGroup: DTCGGroup = {};
      for (const [groupName, entries] of Object.entries(data.themeTokens.utility[mode])) {
        const tokenGroup: DTCGGroup = {};
        for (const [key, value] of Object.entries(entries)) {
          tokenGroup[key] = colorToken(value);
        }
        modeGroup[groupName] = tokenGroup;
      }
      utility[mode] = modeGroup;
    }
    result['utility'] = utility;
  }

  return result;
}

// ── Import: DTCG → PaletteData ──

export function dtcgToPalette(dtcg: DTCGFile): Partial<PaletteData> {
  const colors: string[] = [];
  const names: string[] = [];
  const palette: Record<string, { light: MuiColorVariant; dark: MuiColorVariant }>[] = [];

  // Parse action-colors
  const actionColors = dtcg['action-colors'];
  if (actionColors) {
    for (const [name, group] of Object.entries(actionColors)) {
      if (name.startsWith('$') || typeof group === 'string') continue;
      const colorGroup = group as DTCGGroup;
      const lightGroup = colorGroup['light'] as DTCGGroup | undefined;
      const darkGroup = colorGroup['dark'] as DTCGGroup | undefined;

      if (!lightGroup || !darkGroup) continue;

      const extractVariant = (g: DTCGGroup): MuiColorVariant => ({
        main: (g['main'] as DTCGToken)?.$value ?? '#000000',
        dark: (g['dark'] as DTCGToken)?.$value ?? '#000000',
        light: (g['light'] as DTCGToken)?.$value ?? '#000000',
        lighter: (g['lighter'] as DTCGToken)?.$value ?? '#000000',
        contrastText: (g['contrastText'] as DTCGToken)?.$value ?? '#ffffff',
      });

      names.push(name);
      colors.push(extractVariant(lightGroup).main);
      palette.push({ [name]: { light: extractVariant(lightGroup), dark: extractVariant(darkGroup) } });
    }
  }

  const extractShades = (g: DTCGGroup): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(g)) {
      if (key.startsWith('$')) continue;
      if (val && typeof val === 'object' && '$value' in val) {
        result[key] = (val as DTCGToken).$value;
      }
    }
    return result;
  };

  // Parse grey
  let grey: { light: Record<string, string>; dark: Record<string, string> } | null = null;
  const greyGroup = dtcg['grey'];
  if (greyGroup && typeof greyGroup === 'object') {
    grey = {
      light: extractShades(greyGroup['light'] as DTCGGroup ?? {}),
      dark: extractShades(greyGroup['dark'] as DTCGGroup ?? {}),
    };
  }

  // Parse utility
  const utilityGroup = dtcg['utility'];
  const extractUtility = (modeGroup: DTCGGroup): Record<string, Record<string, string>> => {
    const result: Record<string, Record<string, string>> = {};
    for (const [groupName, group] of Object.entries(modeGroup)) {
      if (groupName.startsWith('$') || !group || typeof group !== 'object') continue;
      const entries: Record<string, string> = {};
      for (const [key, val] of Object.entries(group as DTCGGroup)) {
        if (key.startsWith('$')) continue;
        if (val && typeof val === 'object' && '$value' in val) {
          entries[key] = (val as DTCGToken).$value;
        }
      }
      result[groupName] = entries;
    }
    return result;
  };

  if (utilityGroup && typeof utilityGroup === 'object') {
    const lightUtility = utilityGroup['light'] ? extractUtility(utilityGroup['light'] as DTCGGroup) : undefined;
    const darkUtility = utilityGroup['dark'] ? extractUtility(utilityGroup['dark'] as DTCGGroup) : undefined;

    if (lightUtility && darkUtility) {
      return {
        numColors: colors.length,
        colors,
        names,
        palette,
        themeTokens: {
          grey: grey ?? { light: {}, dark: {} },
          utility: { light: lightUtility, dark: darkUtility },
        },
      };
    }
  }

  return {
    numColors: colors.length,
    colors,
    names,
    palette,
    themeTokens: grey ? { grey, utility: { light: {}, dark: {} } } : null,
  };
}

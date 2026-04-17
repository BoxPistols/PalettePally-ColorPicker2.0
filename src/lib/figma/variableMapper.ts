import { PaletteData } from '@/lib/types/palette';
import { paletteToDTCG } from './dtcg';
import { DTCGToken, DTCGGroup } from '@/lib/types/dtcg';
import { MuiColorVariant } from '@/components/colorUtils';
import {
  FigmaVariablesResponse,
  FigmaColor,
  ParsedVariable,
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

// 指定グループ配下のリーフトークンを `{prefix}/{shade}` 形式でフラット化
function flattenTokens(
  g: DTCGGroup,
  prefix: string
): { path: string; value: string }[] {
  const items: { path: string; value: string }[] = [];
  for (const [key, val] of Object.entries(g)) {
    if (key.startsWith('$')) continue;
    if (val && typeof val === 'object' && '$value' in val) {
      items.push({
        path: prefix ? `${prefix}/${key}` : key,
        value: (val as DTCGToken).$value,
      });
    } else if (val && typeof val === 'object') {
      items.push(...flattenTokens(val as DTCGGroup, prefix ? `${prefix}/${key}` : key));
    }
  }
  return items;
}

export function buildPushPayload(paletteData: PaletteData): PushOperation {
  const dtcg = paletteToDTCG(paletteData);
  const collections: PushOperation['collections'] = [];

  for (const [collectionName, group] of Object.entries(dtcg)) {
    const variables: { name: string; light: string; dark: string }[] = [];
    const g = group as DTCGGroup;

    // action-colors は {name}.{mode}.{shade} 構造、grey/utility は {mode}.{shade} 構造
    // 直下に light/dark がある → 後者
    const topLight = g['light'] as DTCGGroup | undefined;
    const topDark = g['dark'] as DTCGGroup | undefined;

    if (topLight && topDark) {
      // grey / utility: 直下が mode
      const lightItems = flattenTokens(topLight, '');
      const darkItems = flattenTokens(topDark, '');
      const darkMap = new Map(darkItems.map(d => [d.path, d.value]));
      for (const item of lightItems) {
        variables.push({
          name: `light/${item.path}`,
          light: item.value,
          dark: item.value,
        });
      }
      for (const item of darkItems) {
        variables.push({
          name: `dark/${item.path}`,
          light: darkMap.get(item.path) ?? item.value,
          dark: item.value,
        });
      }
    } else {
      // action-colors: {name}/{mode}/{shade}
      for (const [name, child] of Object.entries(g)) {
        if (name.startsWith('$')) continue;
        if (!child || typeof child !== 'object' || '$value' in child) continue;
        const childGroup = child as DTCGGroup;
        const light = childGroup['light'] as DTCGGroup | undefined;
        const dark = childGroup['dark'] as DTCGGroup | undefined;
        if (!light || !dark) continue;

        const lightItems = flattenTokens(light, '');
        const darkItems = flattenTokens(dark, '');
        const darkMap = new Map(darkItems.map(d => [d.path, d.value]));

        for (const item of lightItems) {
          variables.push({
            name: `${name}/light/${item.path}`,
            light: item.value,
            dark: darkMap.get(item.path) ?? item.value,
          });
        }
        for (const item of darkItems) {
          variables.push({
            name: `${name}/dark/${item.path}`,
            light: item.value,
            dark: item.value,
          });
        }
      }
    }

    if (variables.length > 0) {
      collections.push({ name: collectionName, variables });
    }
  }

  return { collections };
}

// ── Import adapter: ParsedVariable[] → PaletteData (MUI 5-shade 構造に復元) ──
//
// push.ts が出力する命名規則をそのまま逆変換する:
//   action-colors: "{name}/light/{shade}" / "{name}/dark/{shade}"
//   grey:          "light/{tone}" / "dark/{tone}"
//   utility:       "light/{group}/{key}" / "dark/{group}/{key}"

const SHADE_KEYS: (keyof MuiColorVariant)[] = [
  'main',
  'dark',
  'light',
  'lighter',
  'contrastText',
];

const emptyVariant = (): MuiColorVariant => ({
  main: '#000000',
  dark: '#000000',
  light: '#000000',
  lighter: '#000000',
  contrastText: '#ffffff',
});

export function parsedVariablesToPalette(
  parsed: ParsedVariable[]
): Partial<PaletteData> {
  const actionByName = new Map<
    string,
    { light: MuiColorVariant; dark: MuiColorVariant }
  >();
  const grey: { light: Record<string, string>; dark: Record<string, string> } = {
    light: {},
    dark: {},
  };
  const utility: {
    light: Record<string, Record<string, string>>;
    dark: Record<string, Record<string, string>>;
  } = { light: {}, dark: {} };

  for (const v of parsed) {
    if (!v.lightValue.startsWith('#')) continue;
    const segments = v.name.split('/').filter(Boolean);

    if (v.collection === 'action-colors' && segments.length === 3) {
      const [name, mode, shade] = segments;
      if (mode !== 'light' && mode !== 'dark') continue;
      if (!SHADE_KEYS.includes(shade as keyof MuiColorVariant)) continue;

      if (!actionByName.has(name)) {
        actionByName.set(name, { light: emptyVariant(), dark: emptyVariant() });
      }
      const pair = actionByName.get(name)!;
      pair[mode][shade as keyof MuiColorVariant] = v.lightValue;
      // dark モード値は darkValue から取る
      if (mode === 'dark' && v.darkValue.startsWith('#')) {
        pair.dark[shade as keyof MuiColorVariant] = v.darkValue;
      }
      if (mode === 'light' && v.darkValue.startsWith('#')) {
        // light モードに dark 値が紐付いていた場合は dark pair にも反映（後勝ち回避）
        if (pair.dark[shade as keyof MuiColorVariant] === '#000000') {
          pair.dark[shade as keyof MuiColorVariant] = v.darkValue;
        }
      }
    } else if (v.collection === 'grey' && segments.length === 2) {
      const [mode, tone] = segments;
      if (mode === 'light') grey.light[tone] = v.lightValue;
      if (mode === 'dark') grey.dark[tone] = v.darkValue.startsWith('#') ? v.darkValue : v.lightValue;
    } else if (v.collection === 'utility' && segments.length === 3) {
      const [mode, group, key] = segments;
      if (mode !== 'light' && mode !== 'dark') continue;
      const target = utility[mode];
      if (!target[group]) target[group] = {};
      target[group][key] = mode === 'dark' && v.darkValue.startsWith('#') ? v.darkValue : v.lightValue;
    }
  }

  const names = Array.from(actionByName.keys());
  const colors = names.map(n => actionByName.get(n)!.light.main);
  const palette = names.map(n => ({ [n]: actionByName.get(n)! }));

  const hasGrey = Object.keys(grey.light).length > 0 || Object.keys(grey.dark).length > 0;
  const hasUtility = Object.keys(utility.light).length > 0 || Object.keys(utility.dark).length > 0;

  const themeTokens = hasGrey || hasUtility
    ? {
      grey: hasGrey ? grey : { light: {}, dark: {} },
      utility: hasUtility ? utility : { light: {}, dark: {} },
    }
    : null;

  return {
    numColors: colors.length,
    colors,
    names,
    palette,
    themeTokens,
  };
}

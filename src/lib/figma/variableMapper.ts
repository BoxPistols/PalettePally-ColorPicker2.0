import { PaletteData } from '@/lib/types/palette';
import { paletteToDTCG } from './dtcg';
import { DTCGToken, DTCGGroup } from '@/lib/types/dtcg';
import { MuiColorVariant, generateColorScheme } from '@/components/colorUtils';
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
//
// 命名規則（mode は Figma の Variable Mode で表現し、変数名には含めない）:
//   action-colors: "{name}/{shade}"          例: "primary/main"
//   grey:          "{tone}"                  例: "50"
//   utility:       "{group}/{key}"           例: "text/primary"

type PushOperation = {
  collections: { name: string; variables: { name: string; light: string; dark: string }[] }[];
};

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

// light/dark の 2 グループを path 単位でペアにして variable に束ねる
function pairLightDark(
  lightItems: { path: string; value: string }[],
  darkItems: { path: string; value: string }[],
  namePrefix: string
): { name: string; light: string; dark: string }[] {
  const darkMap = new Map(darkItems.map(d => [d.path, d.value]));
  const lightMap = new Map(lightItems.map(l => [l.path, l.value]));
  const paths = new Set<string>();
  lightMap.forEach((_, k) => paths.add(k));
  darkMap.forEach((_, k) => paths.add(k));

  const out: { name: string; light: string; dark: string }[] = [];
  paths.forEach(path => {
    const light = lightMap.get(path);
    const dark = darkMap.get(path);
    // どちらかのモードにしか存在しない場合、もう片方にフォールバック
    const lightVal = light ?? dark;
    const darkVal = dark ?? light;
    if (!lightVal || !darkVal) return;
    out.push({
      name: namePrefix ? `${namePrefix}/${path}` : path,
      light: lightVal,
      dark: darkVal,
    });
  });
  return out;
}

export function buildPushPayload(paletteData: PaletteData): PushOperation {
  const dtcg = paletteToDTCG(paletteData);
  const collections: PushOperation['collections'] = [];

  for (const [collectionName, group] of Object.entries(dtcg)) {
    const variables: { name: string; light: string; dark: string }[] = [];
    const g = group as DTCGGroup;

    const topLight = g['light'] as DTCGGroup | undefined;
    const topDark = g['dark'] as DTCGGroup | undefined;

    if (topLight && topDark) {
      // grey / utility: collection.{mode}.{shade-or-path}
      const lightItems = flattenTokens(topLight, '');
      const darkItems = flattenTokens(topDark, '');
      variables.push(...pairLightDark(lightItems, darkItems, ''));
    } else {
      // action-colors: collection.{name}.{mode}.{shade}
      for (const [name, child] of Object.entries(g)) {
        if (name.startsWith('$')) continue;
        if (!child || typeof child !== 'object' || '$value' in child) continue;
        const childGroup = child as DTCGGroup;
        const light = childGroup['light'] as DTCGGroup | undefined;
        const dark = childGroup['dark'] as DTCGGroup | undefined;
        if (!light || !dark) continue;

        const lightItems = flattenTokens(light, '');
        const darkItems = flattenTokens(dark, '');
        variables.push(...pairLightDark(lightItems, darkItems, name));
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
// 新命名規則（mode は Figma Variable Mode 側）:
//   action-colors: "{name}/{shade}"   例: "primary/main"
//   grey:          "{tone}"           例: "50"
//   utility:       "{group}/{key}"    例: "text/primary"

const SHADE_KEYS: readonly (keyof MuiColorVariant)[] = [
  'main',
  'dark',
  'light',
  'lighter',
  'contrastText',
] as const;

// 各シェードの値とセット済みフラグを追跡するための内部構造
type PartialVariant = {
  values: Partial<MuiColorVariant>;
  set: Set<keyof MuiColorVariant>;
};
const emptyPartial = (): PartialVariant => ({ values: {}, set: new Set() });

export function parsedVariablesToPalette(
  parsed: ParsedVariable[]
): Partial<PaletteData> {
  const actionByName = new Map<
    string,
    { light: PartialVariant; dark: PartialVariant }
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
    const darkHex = v.darkValue.startsWith('#') ? v.darkValue : v.lightValue;

    if (v.collection === 'action-colors' && segments.length === 2) {
      const [name, shade] = segments;
      if (!SHADE_KEYS.includes(shade as keyof MuiColorVariant)) continue;

      if (!actionByName.has(name)) {
        actionByName.set(name, { light: emptyPartial(), dark: emptyPartial() });
      }
      const pair = actionByName.get(name)!;
      const key = shade as keyof MuiColorVariant;
      pair.light.values[key] = v.lightValue;
      pair.light.set.add(key);
      pair.dark.values[key] = darkHex;
      pair.dark.set.add(key);
    } else if (v.collection === 'grey' && segments.length === 1) {
      const [tone] = segments;
      grey.light[tone] = v.lightValue;
      grey.dark[tone] = darkHex;
    } else if (v.collection === 'utility' && segments.length === 2) {
      const [groupName, key] = segments;
      if (!utility.light[groupName]) utility.light[groupName] = {};
      if (!utility.dark[groupName]) utility.dark[groupName] = {};
      utility.light[groupName][key] = v.lightValue;
      utility.dark[groupName][key] = darkHex;
    }
  }

  // main が欠けているエントリは action-colors として扱わない。
  // 他のシェードが欠けているものは main から generateColorScheme で補完する
  // （emptyVariant() の #000000 ダミーが PaletteData に残らないようにする）。
  const resolvedByName = new Map<
    string,
    { light: MuiColorVariant; dark: MuiColorVariant }
  >();
  // 注: tsconfig target=es5 + downlevelIteration 未設定のため、
  // Map の for-of は Array.from(.entries()) を経由する必要がある
  Array.from(actionByName.entries()).forEach(([name, pair]) => {
    if (!pair.light.set.has('main')) return;
    const mainHex = pair.light.values.main!;
    const defaults = generateColorScheme(mainHex, 'auto');
    const resolved = {
      light: { ...defaults.light } as MuiColorVariant,
      dark: { ...defaults.dark } as MuiColorVariant,
    };
    for (const key of SHADE_KEYS) {
      if (pair.light.set.has(key)) resolved.light[key] = pair.light.values[key]!;
      if (pair.dark.set.has(key)) resolved.dark[key] = pair.dark.values[key]!;
    }
    resolvedByName.set(name, resolved);
  });

  const names = Array.from(resolvedByName.keys());
  const colors = names.map(n => resolvedByName.get(n)!.light.main);
  const palette = names.map(n => ({ [n]: resolvedByName.get(n)! }));

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

// PalettePally Bridge — Figma Plugin backend.
// Plugin API は全プランで利用可。REST API (Enterprise 限定) の代替として
// DTCG JSON を Variable Collections に書き戻す／現在の Collections を DTCG JSON
// に書き出す。
//
// 命名規則（mode は Figma Variable Mode で表現し、変数名には含めない）:
//   action-colors: "{name}/{shade}"    例: "primary/main"
//   grey:          "{tone}"            例: "50"
//   utility:       "{group}/{key}"     例: "text/primary"

type DTCGToken = { $value: string; $type?: string; $description?: string };
type DTCGGroup = { [key: string]: DTCGToken | DTCGGroup | string | undefined };
type DTCGFile = { [collection: string]: DTCGGroup };

type UIMessage =
  | { type: 'import-dtcg'; json: string }
  | { type: 'export-dtcg' }
  | { type: 'cancel' };

type LeafItem = { path: string; hex: string };
type VariableSpec = { name: string; lightHex: string; darkHex: string };

figma.showUI(__html__, { width: 420, height: 560, themeColors: true });

figma.ui.onmessage = async (msg: UIMessage) => {
  try {
    if (msg.type === 'import-dtcg') {
      await importDTCG(msg.json);
    } else if (msg.type === 'export-dtcg') {
      await exportDTCG();
    } else if (msg.type === 'cancel') {
      figma.closePlugin();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    figma.ui.postMessage({ type: 'error', message });
  }
};

// ── Helpers ──

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  // 3/6 桁のみ受理。4/8 桁（alpha 付き）は Figma Variables の COLOR 型と不整合なので拒否。
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) {
    throw new Error(`Unsupported hex color: "${hex}" (expected #rgb or #rrggbb; alpha channels are not supported)`);
  }
  const full = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h;
  return {
    r: parseInt(full.substring(0, 2), 16) / 255,
    g: parseInt(full.substring(2, 4), 16) / 255,
    b: parseInt(full.substring(4, 6), 16) / 255,
  };
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function isToken(v: unknown): v is DTCGToken {
  return typeof v === 'object' && v !== null && '$value' in (v as object);
}

function isRgb(v: unknown): v is { r: number; g: number; b: number } {
  return typeof v === 'object' && v !== null && 'r' in v && 'g' in v && 'b' in v;
}

function flattenGroup(
  group: DTCGGroup,
  prefix: string,
  out: LeafItem[]
): void {
  for (const key in group) {
    if (key.startsWith('$')) continue;
    const value = group[key];
    if (!value || typeof value === 'string') continue;
    if (isToken(value)) {
      const hex = value.$value;
      if (typeof hex === 'string' && hex.startsWith('#')) {
        out.push({ path: prefix ? `${prefix}/${key}` : key, hex });
      }
    } else {
      flattenGroup(value as DTCGGroup, prefix ? `${prefix}/${key}` : key, out);
    }
  }
}

// light/dark の leaf をペアリングして mode-aware な VariableSpec に束ねる
function pairLeaves(
  lightItems: LeafItem[],
  darkItems: LeafItem[],
  namePrefix: string
): VariableSpec[] {
  const lightMap = new Map(lightItems.map(l => [l.path, l.hex]));
  const darkMap = new Map(darkItems.map(d => [d.path, d.hex]));
  const paths = new Set<string>([...lightMap.keys(), ...darkMap.keys()]);

  const specs: VariableSpec[] = [];
  for (const path of paths) {
    const lightHex = lightMap.get(path) ?? darkMap.get(path);
    const darkHex = darkMap.get(path) ?? lightMap.get(path);
    if (!lightHex || !darkHex) continue;
    specs.push({
      name: namePrefix ? `${namePrefix}/${path}` : path,
      lightHex,
      darkHex,
    });
  }
  return specs;
}

// Collection 構造（action-colors は 3 階層、その他は 2 階層）を解釈して
// VariableSpec[] に変換する
function parseCollectionToSpecs(
  collectionName: string,
  group: DTCGGroup
): VariableSpec[] {
  const specs: VariableSpec[] = [];
  const topLight = group['light'];
  const topDark = group['dark'];

  if (
    topLight && typeof topLight === 'object' && !isToken(topLight) &&
    topDark && typeof topDark === 'object' && !isToken(topDark)
  ) {
    // grey / utility: 直下が mode
    const lightItems: LeafItem[] = [];
    const darkItems: LeafItem[] = [];
    flattenGroup(topLight as DTCGGroup, '', lightItems);
    flattenGroup(topDark as DTCGGroup, '', darkItems);
    specs.push(...pairLeaves(lightItems, darkItems, ''));
    return specs;
  }

  // action-colors: 直下が {name}、その下に {light|dark} がある
  for (const name in group) {
    if (name.startsWith('$')) continue;
    const sub = group[name];
    if (!sub || typeof sub === 'string' || isToken(sub)) continue;
    const subGroup = sub as DTCGGroup;
    const subLight = subGroup['light'];
    const subDark = subGroup['dark'];
    if (
      !subLight || typeof subLight === 'string' || isToken(subLight) ||
      !subDark || typeof subDark === 'string' || isToken(subDark)
    ) {
      // action-colors でも light/dark が見つからない分岐はスキップ
      if (collectionName !== 'action-colors') continue;
    }
    const lightItems: LeafItem[] = [];
    const darkItems: LeafItem[] = [];
    if (subLight && typeof subLight === 'object' && !isToken(subLight)) {
      flattenGroup(subLight as DTCGGroup, '', lightItems);
    }
    if (subDark && typeof subDark === 'object' && !isToken(subDark)) {
      flattenGroup(subDark as DTCGGroup, '', darkItems);
    }
    if (lightItems.length === 0 && darkItems.length === 0) continue;
    specs.push(...pairLeaves(lightItems, darkItems, name));
  }
  return specs;
}

// ── Import: DTCG JSON → Figma Variable Collections ──

async function importDTCG(jsonText: string): Promise<void> {
  let dtcg: DTCGFile;
  try {
    dtcg = JSON.parse(jsonText) as DTCGFile;
  } catch {
    throw new Error('JSON のパースに失敗しました');
  }

  const stats = { collections: 0, variables: 0, updated: 0 };

  // ループ外で 1 回だけ全取得（N collections × 非同期呼び出しを回避）
  const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const existingColorVars = await figma.variables.getLocalVariablesAsync('COLOR');
  const collectionsByName = new Map(existingCollections.map(c => [c.name, c]));
  const varsByCollectionId = new Map<string, Map<string, Variable>>();
  for (const v of existingColorVars) {
    let bucket = varsByCollectionId.get(v.variableCollectionId);
    if (!bucket) {
      bucket = new Map();
      varsByCollectionId.set(v.variableCollectionId, bucket);
    }
    bucket.set(v.name, v);
  }

  for (const collectionName in dtcg) {
    if (collectionName.startsWith('$')) continue;
    const groupRaw = dtcg[collectionName];
    if (!groupRaw || typeof groupRaw === 'string' || isToken(groupRaw)) continue;
    const group = groupRaw as DTCGGroup;

    const specs = parseCollectionToSpecs(collectionName, group);
    if (specs.length === 0) continue;

    let collection = collectionsByName.get(collectionName);
    let lightModeId: string;
    let darkModeId: string;

    if (!collection) {
      collection = figma.variables.createVariableCollection(collectionName);
      lightModeId = collection.modes[0].modeId;
      collection.renameMode(lightModeId, 'light');
      darkModeId = collection.addMode('dark');
      collectionsByName.set(collectionName, collection);
      stats.collections += 1;
    } else {
      const light = collection.modes.find(m => m.name.toLowerCase().includes('light'));
      const dark = collection.modes.find(m => m.name.toLowerCase().includes('dark'));
      lightModeId = light?.modeId ?? collection.modes[0].modeId;
      darkModeId = dark?.modeId ?? collection.modes[1]?.modeId ?? collection.addMode('dark');
    }

    const byName = varsByCollectionId.get(collection.id) ?? new Map<string, Variable>();

    for (const spec of specs) {
      let variable = byName.get(spec.name);
      if (!variable) {
        variable = figma.variables.createVariable(spec.name, collection, 'COLOR');
        byName.set(spec.name, variable);
        stats.variables += 1;
      } else {
        stats.updated += 1;
      }
      variable.setValueForMode(lightModeId, hexToRgb(spec.lightHex));
      variable.setValueForMode(darkModeId, hexToRgb(spec.darkHex));
    }
    varsByCollectionId.set(collection.id, byName);
  }

  figma.ui.postMessage({ type: 'import-done', stats });
  figma.notify(
    `Imported: ${stats.collections} collection(s), ${stats.variables} new, ${stats.updated} updated`,
  );
}

// ── Export: Figma Variable Collections → DTCG JSON ──

async function exportDTCG(): Promise<void> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync('COLOR');

  const result: DTCGFile = {};

  for (const col of collections) {
    const lightMode = col.modes.find(m => m.name.toLowerCase().includes('light'))
      ?? col.modes[0];
    const darkMode = col.modes.find(m => m.name.toLowerCase().includes('dark'))
      ?? col.modes[1]
      ?? lightMode;

    const ours = variables.filter(v => v.variableCollectionId === col.id);
    if (ours.length === 0) continue;

    if (col.name === 'action-colors') {
      // {name}/{shade} → {name}.{mode}.{shade}
      const group: DTCGGroup = {};
      for (const v of ours) {
        const segments = v.name.split('/').filter(Boolean);
        if (segments.length !== 2) continue;
        const [name, shade] = segments;
        const lightVal = v.valuesByMode[lightMode.modeId];
        const darkVal = v.valuesByMode[darkMode.modeId];
        if (!isRgb(lightVal)) continue;
        const lightHex = rgbToHex(lightVal);
        const darkHex = isRgb(darkVal) ? rgbToHex(darkVal) : lightHex;

        if (!group[name]) group[name] = { light: {}, dark: {} };
        const nameGroup = group[name] as DTCGGroup;
        (nameGroup.light as DTCGGroup)[shade] = { $value: lightHex, $type: 'color' };
        (nameGroup.dark as DTCGGroup)[shade] = { $value: darkHex, $type: 'color' };
      }
      if (Object.keys(group).length > 0) result[col.name] = group;
    } else {
      // grey / utility: {path} → {mode}.{path}
      const light: DTCGGroup = {};
      const dark: DTCGGroup = {};
      for (const v of ours) {
        const segments = v.name.split('/').filter(Boolean);
        if (segments.length === 0) continue;
        const lightVal = v.valuesByMode[lightMode.modeId];
        const darkVal = v.valuesByMode[darkMode.modeId];
        if (!isRgb(lightVal)) continue;
        const lightHex = rgbToHex(lightVal);
        const darkHex = isRgb(darkVal) ? rgbToHex(darkVal) : lightHex;

        insertNested(light, segments, lightHex);
        insertNested(dark, segments, darkHex);
      }
      if (Object.keys(light).length > 0 || Object.keys(dark).length > 0) {
        result[col.name] = { light, dark };
      }
    }
  }

  figma.ui.postMessage({
    type: 'export-done',
    json: JSON.stringify(result, null, 2),
  });
}

function insertNested(
  root: DTCGGroup,
  segments: string[],
  hex: string
): void {
  let node: DTCGGroup = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const next = node[seg];
    if (!next || typeof next === 'string' || isToken(next)) {
      const fresh: DTCGGroup = {};
      node[seg] = fresh;
      node = fresh;
    } else {
      node = next as DTCGGroup;
    }
  }
  const leaf = segments[segments.length - 1];
  node[leaf] = { $value: hex, $type: 'color' };
}

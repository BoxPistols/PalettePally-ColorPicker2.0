// PalettePally Bridge — Figma Plugin backend.
// Plugin API は全プランで利用可。REST API (Enterprise 限定) の代替として DTCG JSON
// を Variable Collections に書き戻す／現在の Collections を DTCG JSON に書き出す。

type DTCGToken = { $value: string; $type?: string; $description?: string };
type DTCGGroup = { [key: string]: DTCGToken | DTCGGroup | string | undefined };
type DTCGFile = { [collection: string]: DTCGGroup };

type UIMessage =
  | { type: 'import-dtcg'; json: string }
  | { type: 'export-dtcg' }
  | { type: 'cancel' };

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

function flattenGroup(
  group: DTCGGroup,
  prefix: string,
  out: { path: string; hex: string }[]
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

// ── Import: DTCG JSON → Figma Variable Collections ──

async function importDTCG(jsonText: string): Promise<void> {
  let dtcg: DTCGFile;
  try {
    dtcg = JSON.parse(jsonText) as DTCGFile;
  } catch {
    throw new Error('JSON のパースに失敗しました');
  }

  const stats = { collections: 0, variables: 0, updated: 0 };

  for (const collectionName in dtcg) {
    if (collectionName.startsWith('$')) continue;
    const groupRaw = dtcg[collectionName];
    if (!groupRaw || typeof groupRaw === 'string' || isToken(groupRaw)) continue;
    const group = groupRaw as DTCGGroup;

    const lightGroupRaw = group['light'];
    const darkGroupRaw = group['dark'];
    if (
      !lightGroupRaw || typeof lightGroupRaw === 'string' || isToken(lightGroupRaw) ||
      !darkGroupRaw || typeof darkGroupRaw === 'string' || isToken(darkGroupRaw)
    ) {
      continue;
    }

    const lightItems: { path: string; hex: string }[] = [];
    const darkItems: { path: string; hex: string }[] = [];
    flattenGroup(lightGroupRaw as DTCGGroup, '', lightItems);
    flattenGroup(darkGroupRaw as DTCGGroup, '', darkItems);
    const darkMap = new Map(darkItems.map(d => [d.path, d.hex]));

    // 既存 Collection を検索（非同期）
    const existing = await figma.variables.getLocalVariableCollectionsAsync();
    let collection = existing.find(c => c.name === collectionName);
    let lightModeId: string;
    let darkModeId: string;

    if (!collection) {
      collection = figma.variables.createVariableCollection(collectionName);
      lightModeId = collection.modes[0].modeId;
      collection.renameMode(lightModeId, 'light');
      darkModeId = collection.addMode('dark');
      stats.collections += 1;
    } else {
      const light = collection.modes.find(m => m.name.toLowerCase().includes('light'));
      const dark = collection.modes.find(m => m.name.toLowerCase().includes('dark'));
      lightModeId = light?.modeId ?? collection.modes[0].modeId;
      darkModeId = dark?.modeId ?? (collection.modes[1]?.modeId ?? collection.addMode('dark'));
    }

    const existingVars = await figma.variables.getLocalVariablesAsync('COLOR');
    const byName = new Map(
      existingVars
        .filter(v => v.variableCollectionId === collection!.id)
        .map(v => [v.name, v])
    );

    for (const item of lightItems) {
      let variable = byName.get(item.path);
      if (!variable) {
        variable = figma.variables.createVariable(item.path, collection, 'COLOR');
        stats.variables += 1;
      } else {
        stats.updated += 1;
      }
      variable.setValueForMode(lightModeId, hexToRgb(item.hex));
      const darkHex = darkMap.get(item.path) ?? item.hex;
      variable.setValueForMode(darkModeId, hexToRgb(darkHex));
    }
  }

  figma.ui.postMessage({
    type: 'import-done',
    stats,
  });
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

    const light: DTCGGroup = {};
    const dark: DTCGGroup = {};

    const ours = variables.filter(v => v.variableCollectionId === col.id);
    for (const v of ours) {
      const segments = v.name.split('/');
      const lightVal = v.valuesByMode[lightMode.modeId];
      const darkVal = v.valuesByMode[darkMode.modeId];
      if (!isRgb(lightVal)) continue;

      insertNested(light, segments, rgbToHex(lightVal));
      if (isRgb(darkVal)) {
        insertNested(dark, segments, rgbToHex(darkVal));
      } else {
        insertNested(dark, segments, rgbToHex(lightVal));
      }
    }

    result[col.name] = { light, dark };
  }

  figma.ui.postMessage({
    type: 'export-done',
    json: JSON.stringify(result, null, 2),
  });
}

function isRgb(v: unknown): v is { r: number; g: number; b: number } {
  return typeof v === 'object' && v !== null && 'r' in v && 'g' in v && 'b' in v;
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

// Figma Variables REST API types

export type FigmaColor = {
  r: number; // 0-1
  g: number;
  b: number;
  a: number;
};

export type FigmaVariableValue = FigmaColor | string | number | boolean;

export type FigmaVariable = {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  valuesByMode: Record<string, FigmaVariableValue>;
  description: string;
  scopes: string[];
};

export type FigmaVariableCollection = {
  id: string;
  name: string;
  key: string;
  modes: { modeId: string; name: string }[];
  variableIds: string[];
};

export type FigmaVariablesResponse = {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, FigmaVariableCollection>;
  };
};

// Push payload types
export type FigmaVariableCreate = {
  action: 'CREATE';
  name: string;
  variableCollectionId: string;
  resolvedType: 'COLOR';
  description?: string;
};

export type FigmaVariableUpdate = {
  action: 'UPDATE';
  id: string;
  name?: string;
  description?: string;
  variableCollectionId?: string;
};

export type FigmaVariableModeValue = {
  variableId: string;
  modeId: string;
  value: FigmaColor;
};

export type FigmaVariableCollectionCreate = {
  action: 'CREATE';
  name: string;
  initialModeId?: string;
};

export type FigmaVariableCollectionUpdate = {
  action: 'UPDATE';
  id: string;
  name?: string;
};

export type FigmaModeCreate = {
  action: 'CREATE';
  variableCollectionId: string;
  name: string;
};

export type FigmaPushPayload = {
  variableCollections?: (FigmaVariableCollectionCreate | FigmaVariableCollectionUpdate)[];
  variableModes?: FigmaModeCreate[];
  variables?: (FigmaVariableCreate | FigmaVariableUpdate)[];
  variableModeValues?: FigmaVariableModeValue[];
};

// Parsed variable for UI display
export type ParsedVariable = {
  collection: string;
  name: string;
  lightValue: string;
  darkValue: string;
};

// Hex ↔ Figma color conversion
export function hexToFigmaColor(hex: string): FigmaColor {
  let h = hex.replace('#', '');
  // 短縮表記 #RGB / #RGBA を #RRGGBB / #RRGGBBAA に展開する。
  // これをしないと 3桁 hex で substring(4,6) が空になり b が NaN になり Figma へ不正色を送る。
  if (h.length === 3 || h.length === 4) {
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  }
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
    // 8桁(#RRGGBBAA)はアルファも反映、それ以外は不透明
    a: h.length >= 8 ? parseInt(h.substring(6, 8), 16) / 255 : 1,
  };
}

export function figmaColorToHex(c: FigmaColor): string {
  const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// Extract fileKey from Figma URL
export function extractFileKey(urlOrKey: string): string | null {
  // Direct key
  if (/^[a-zA-Z0-9]+$/.test(urlOrKey)) return urlOrKey;
  // URL: figma.com/design/:fileKey/... or figma.com/file/:fileKey/...
  const match = urlOrKey.match(/figma\.com\/(?:design|file)\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}

import { ColorPalette, ThemeTokens } from '@/components/colorUtils';

export type PaletteData = {
  numColors: number;
  colors: string[];
  names: string[];
  palette: Record<string, ColorPalette>[];
  themeTokens: ThemeTokens | null;
};

export type PaletteDocument = {
  id: string;
  ownerUid: string;
  name: string;
  description: string;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  shareId: string | null;
  sharePermission: 'view' | 'duplicate' | null;
  tags: string[];
  data: PaletteData;
};

export type PaletteVersion = {
  id: string;
  version: number;
  createdAt: Date;
  label: string;
  data: PaletteData;
  changeNote: string;
};

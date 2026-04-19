import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import chroma from 'chroma-js';
import ColorInputField from './ColorInputField';
import { PaletteCard } from './PaletteGrid';
import { GreyScaleCard, UtilityGroupCard, AddGroupCard } from './ThemeTokenCards';
import { ConfirmDialog } from './common/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useHistory } from '@/hooks/useHistory';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppColors, AppColors } from '@/hooks/useAppColors';
import { ColorSchemeToggle } from './common/ColorSchemeToggle';
import { HarmonyDialog } from './harmony/HarmonyDialog';
import { CompareDialog } from './compare/CompareDialog';
import { useAuthContext } from './auth/AuthProvider';
import { LoginDialog } from './auth/LoginDialog';
import { UserMenu } from './auth/UserMenu';
import { SavePaletteDialog } from './palette/SavePaletteDialog';
import { PaletteListDrawer } from './palette/PaletteListDrawer';
import { ShareDialog } from './palette/ShareDialog';
import { PaletteVersionHistory } from './palette/PaletteVersionHistory';
import { generateColorScheme, generateThemeTokens, defaultColorName, defaultColorForName, ColorPalette, MuiColorVariant, ThemeTokens, ContrastMode } from './colorUtils';
import { PaletteData, PaletteDocument } from '@/lib/types/palette';
import { A11yThreshold } from '@/lib/wcag';
import { ParsedVariable } from '@/lib/figma/types';
import { parsedVariablesToPalette } from '@/lib/figma/variableMapper';
import { HelpDialog } from './help/HelpDialog';
import { ExampleDialog } from './example/ExampleDialog';
import { ExportHubDialog } from './export/ExportHubDialog';
import { ImportHubDialog } from './export/ImportHubDialog';
import { FigmaConnectDialog } from './figma/FigmaConnectDialog';
import { FigmaExportDialog } from './figma/FigmaExportDialog';
import { FigmaImportDialog } from './figma/FigmaImportDialog';
import * as firestoreService from '@/lib/firebase/firestore';

// Pallet + Palette: ハンドリフトがカラー版を運ぶダブルミーニング
const LogoMark = () => (
  <svg width='48' height='40' viewBox='0 0 48 40' fill='none'>
    {/* ハンドリフト本体 (L字フレーム) */}
    <path d='M 2 3 L 6 3 L 6 30 L 46 30 L 46 33 L 2 33 Z' fill='currentColor' />
    {/* 車輪 */}
    <circle cx='8' cy='36' r='2.5' fill='none' stroke='currentColor' strokeWidth='1.5' />
    {/* カラー版ブロック (テトリス状配置) */}
    <rect x='9' y='5' width='18' height='6' rx='1' fill='#E57373' />
    <rect x='29' y='5' width='15' height='6' rx='1' fill='#4DB6AC' />
    <rect x='9' y='13' width='12' height='6' rx='1' fill='#FFD54F' />
    <rect x='23' y='13' width='21' height='6' rx='1' fill='#4DB6AC' />
    <rect x='9' y='21' width='12' height='6' rx='1' fill='#FFD54F' />
    <rect x='23' y='21' width='21' height='6' rx='1' fill='#B39DDB' />
    {/* パレット支柱 */}
    <rect x='10' y='33' width='4' height='3' fill='currentColor' />
    <rect x='23' y='33' width='4' height='3' fill='currentColor' />
    <rect x='36' y='33' width='4' height='3' fill='currentColor' />
  </svg>
);

// ヘッダーボタン共通スタイル。app color scheme に追従するので関数化し、
// ColorPicker 内で useMemo で安定化する。
function makeHeaderButtonSx(c: AppColors) {
  return {
    minWidth: 0,
    px: 1.5,
    py: 0.625,
    borderRadius: '8px',
    border: `1px solid ${c.border}`,
    bgcolor: c.chromeBg,
    color: c.textPrimary,
    fontSize: '0.72rem',
    fontWeight: 600,
    textTransform: 'none' as const,
    letterSpacing: '0.01em',
    transition: 'all 0.15s ease',
    '&:hover': {
      bgcolor: c.chromeBgHover,
      borderColor: c.borderHover,
    },
  };
}

function ColorPicker() {
  const { user, firebaseReady } = useAuthContext();
  const { state: confirmState, confirm, handleConfirm, handleCancel } = useConfirmDialog();
  const c = useAppColors();
  const headerButtonSx = React.useMemo(() => makeHeaderButtonSx(c), [c]);

  // Cloud state
  const [loginOpen, setLoginOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [currentPaletteId, setCurrentPaletteId] = useState<string | null>(null);
  const [currentPaletteName, setCurrentPaletteName] = useState('');
  const [currentShareId, setCurrentShareId] = useState<string | null>(null);

  // contrastText 戦略 ('auto' = WCAG準拠, 'white' = 常に白)
  const [contrastMode, setContrastMode] = useState<ContrastMode>('auto');
  // a11y 許容しきい値（Preview でゲート表示に使用）
  const [a11yThreshold, setA11yThreshold] = useState<A11yThreshold>('AA');

  // Harmony / WCAG Grid / Help / Example / Export / Import / Figma state
  const [harmonyOpen, setHarmonyOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);
  const [exportHubOpen, setExportHubOpen] = useState(false);
  const [importHubOpen, setImportHubOpen] = useState(false);
  const [figmaConnectOpen, setFigmaConnectOpen] = useState(false);
  const [figmaExportOpen, setFigmaExportOpen] = useState(false);
  const [figmaImportOpen, setFigmaImportOpen] = useState(false);
  const [figmaPat, setFigmaPat] = useState('');
  const [figmaFileKey, setFigmaFileKey] = useState('');
  const figmaConnected = Boolean(figmaPat && figmaFileKey);

  const [numColors, setNumColors] = useState(6);
  const [numColorsInput, setNumColorsInput] = useState('6');
  const [color, setColor] = useState<string[]>([]);
  const [palette, setPalette] = useState<
    { [colorName: string]: ColorPalette }[] | null
  >(null);
  const [colorNames, setColorNames] = useState(
    Array.from({ length: numColors }, (_, i) => defaultColorName(i))
  );

  const [themeTokens, setThemeTokens] = useState<ThemeTokens | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const skipAutoResetRef = useRef(false);
  const initializedRef = useRef(false);
  const prevPrimaryRef = useRef<string | undefined>(undefined);

  const isValidHex = (hex: never) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

  // numColors 変更時のみ色を増減（functional setState でカスケード防止）
  useEffect(() => {
    setColor(prev => {
      if (numColors > prev.length) {
        // 既存色の hue を一度だけ計算（O(n) の chroma コールを削減）
        const hues: number[] = [];
        for (const c of prev) {
          try { hues.push(chroma(c).hsl()[0] || 0); } catch { /* skip */ }
        }
        const result = [...prev];
        for (let i = prev.length; i < numColors; i++) {
          const newColor = generateDistinctColorFromHues(hues);
          result.push(newColor);
          try { hues.push(chroma(newColor).hsl()[0] || 0); } catch { /* skip */ }
        }
        return result;
      }
      return numColors < prev.length ? prev.slice(0, numColors) : prev;
    });
    setColorNames(prev => {
      if (numColors > prev.length) {
        return [
          ...prev,
          ...Array.from(
            { length: numColors - prev.length },
            (_, i) => defaultColorName(prev.length + i)
          ),
        ];
      }
      return numColors < prev.length ? prev.slice(0, numColors) : prev;
    });
  }, [numColors]);

  const handleReset = useCallback(() => {
    skipAutoResetRef.current = false;
    const initialColors = Array.from({ length: numColors }, (_, i) => {
      const name = defaultColorName(i);
      const fallback = chroma.hsl(i * (360 / numColors), 0.8, 0.5).hex();
      return defaultColorForName(name, fallback);
    });
    setColor(initialColors);
    setColorNames(Array.from({ length: numColors }, (_, i) => defaultColorName(i)));
  }, [numColors]);

  // localStorage から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem('palettePally');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.colors?.length > 0) {
        skipAutoResetRef.current = true;
        setNumColors(data.numColors ?? data.colors.length);
        setColor(data.colors);
        setColorNames(data.names ?? data.colors.map((_: string, i: number) => defaultColorName(i)));
        if (data.themeTokens) {
          setThemeTokens(data.themeTokens);
          // 復元済みトークンが primary useEffect で上書きされるのを防ぐ
          prevPrimaryRef.current = data.colors[0];
        }
        if (['auto', 'white', 'black'].includes(data.contrastMode)) {
          setContrastMode(data.contrastMode);
        }
        if (['none', 'A', 'AA', 'AAA'].includes(data.a11yThreshold)) {
          setA11yThreshold(data.a11yThreshold);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // numColors 入力のデバウンス（タイプ中の中間値で再計算しない）
  useEffect(() => {
    const num = parseInt(numColorsInput, 10);
    if (isNaN(num) || num < 1 || num > 24) return;
    if (num === numColors) return;
    const timer = setTimeout(() => setNumColors(num), 250);
    return () => clearTimeout(timer);
  }, [numColorsInput, numColors]);

  // 初回 mount のみ実行（numColors 変更時は再実行しない）
  useEffect(() => {
    if (skipAutoResetRef.current || initializedRef.current) return;
    initializedRef.current = true;
    handleReset();
  }, [handleReset]);

  // localStorage に保存（デバウンス）
  useEffect(() => {
    if (color.length === 0) return;
    const timer = setTimeout(() => {
      localStorage.setItem('palettePally', JSON.stringify({
        numColors,
        colors: color,
        names: colorNames,
        themeTokens,
        contrastMode,
        a11yThreshold,
      }));
    }, 300);
    return () => clearTimeout(timer);
  }, [numColors, color, colorNames, themeTokens, contrastMode, a11yThreshold]);

  function generateDistinctColorFromHues(existingHues: number[]): string {
    const count = existingHues.length;
    const minGap = Math.max(5, Math.floor(300 / Math.max(count, 1)));
    let bestHue = Math.floor(Math.random() * 360);
    let bestDist = 0;

    for (let attempt = 0; attempt < 100; attempt++) {
      const hue = Math.floor(Math.random() * 360);
      let nearest = 360;
      for (const h of existingHues) {
        const diff = Math.abs(h - hue);
        const d = Math.min(diff, 360 - diff);
        if (d < nearest) nearest = d;
        if (nearest < minGap) break;
      }
      if (nearest >= minGap) return chroma.hsl(hue, 0.9, 0.5).hex();
      if (nearest > bestDist) {
        bestDist = nearest;
        bestHue = hue;
      }
    }
    return chroma.hsl(bestHue, 0.9, 0.5).hex();
  }

  useEffect(() => {
    const newPalette = color.map((c, idx) => ({
      [colorNames[idx]]: generateColorScheme(c, contrastMode),
    }));
    setPalette(newPalette);
  }, [color, colorNames, contrastMode]);

  const handleColorNameChange = (index: number, newName: string) => {
    const newNames = [...colorNames];
    newNames[index] = newName;
    setColorNames(newNames);
  };

  const handleColorChange = (index: number, newColor: string) => {
    if (!isValidHex(newColor as never) && newColor !== '#') return;
    const newColors = [...color];
    newColors[index] = newColor;
    setColor(newColors);
  };

  // 個別カラー編集: パレットの特定色を直接変更
  const handlePaletteEdit = useCallback(
    (index: number, mode: 'light' | 'dark', shade: keyof MuiColorVariant, value: string) => {
      setPalette(prev => {
        if (!prev) return prev;
        const updated = [...prev];
        const name = colorNames[index];
        const entry = updated[index][name];
        if (!entry) return prev;
        updated[index] = {
          [name]: {
            ...entry,
            [mode]: { ...entry[mode], [shade]: value },
          },
        };
        return updated;
      });
    },
    [colorNames]
  );

  // Primary から grey + utility tokens を生成（手動編集も可能）
  const primaryColor = color.length > 0 ? color[0] : undefined;
  useEffect(() => {
    if (!primaryColor) return;
    // 初回生成 or primary カラー変更時のみ再生成（手動編集を保護）
    if (!themeTokens || prevPrimaryRef.current !== primaryColor) {
      prevPrimaryRef.current = primaryColor;
      setThemeTokens(generateThemeTokens(primaryColor));
    }
  }, [primaryColor, themeTokens]); // themeTokens を deps に追加 (ESLint fix)

  // ── Cloud Handlers ──

  const buildPaletteData = useCallback((): PaletteData => ({
    numColors,
    colors: color,
    names: colorNames,
    palette: palette ?? [],
    themeTokens,
  }), [numColors, color, colorNames, palette, themeTokens]);

  const handleCloudSave = useCallback(async (name: string, description: string) => {
    if (!user) return;
    if (currentPaletteId) {
      const ok = await confirm({
        title: 'Update Palette',
        message: `"${name}" を上書きしますか？`,
        confirmLabel: 'Update',
        severity: 'warning',
      });
      if (!ok) return;
      await firestoreService.updatePalette(currentPaletteId, buildPaletteData(), description);
    } else {
      const id = await firestoreService.savePalette(user.uid, buildPaletteData(), name, description);
      setCurrentPaletteId(id);
      setCurrentPaletteName(name);
    }
  }, [user, currentPaletteId, buildPaletteData, confirm]);

  const handleCloudLoad = useCallback((doc: PaletteDocument) => {
    setCurrentPaletteId(doc.id);
    setCurrentPaletteName(doc.name);
    setCurrentShareId(doc.shareId);
    setNumColors(doc.data.numColors);
    setColor(doc.data.colors);
    setColorNames(doc.data.names);
    if (doc.data.themeTokens) setThemeTokens(doc.data.themeTokens);
  }, []);

  const handleCloudDelete = useCallback(async (paletteId: string, name: string): Promise<boolean> => {
    const ok = await confirm({
      title: 'Delete Palette',
      message: `"${name}" を完全に削除しますか？この操作は取り消せません。`,
      confirmLabel: 'Delete',
      severity: 'error',
    });
    if (!ok) return false;
    await firestoreService.deletePalette(paletteId);
    if (paletteId === currentPaletteId) {
      setCurrentPaletteId(null);
      setCurrentPaletteName('');
    }
    return true;
  }, [confirm, currentPaletteId]);

  const handleVersionRestore = useCallback(async (versionId: string, version: number): Promise<boolean> => {
    const ok = await confirm({
      title: 'Restore Version',
      message: `v${version} に復元しますか？現在の変更は新しいバージョンとして保存されます。`,
      confirmLabel: 'Restore',
      severity: 'warning',
    });
    if (!ok || !currentPaletteId) return false;
    await firestoreService.restoreVersion(currentPaletteId, versionId);
    const doc = await firestoreService.loadPalette(currentPaletteId);
    handleCloudLoad(doc);
    return true;
  }, [confirm, currentPaletteId, handleCloudLoad]);

  const handleRevokeShare = useCallback(async (): Promise<boolean> => {
    return confirm({
      title: 'Revoke Share Link',
      message: 'このリンクを無効にしますか？既に共有された相手はアクセスできなくなります。',
      confirmLabel: 'Revoke',
      severity: 'error',
    });
  }, [confirm]);

  // 画面モノクロモード (色覚シミュレーション)
  const { greyscale, toggle: toggleGreyscale } = useAppTheme();

  // Undo/Redo (Cmd+Z / Cmd+Shift+Z)
  const { undo, redo, canUndo, canRedo } = useHistory(color, colorNames, (c, n) => {
    setColor(c);
    setColorNames(n);
    setNumColors(c.length);
    setNumColorsInput(String(c.length));
  });

  const handleResetWithConfirm = useCallback(async () => {
    const ok = await confirm({
      title: 'Reset All Colors',
      message: '全てのカラーを初期状態にリセットしますか？',
      confirmLabel: 'Reset',
      severity: 'warning',
    });
    if (ok) handleReset();
  }, [confirm, handleReset]);

  // 既存の color1/color2 名を semantic 名 (primary/secondary/...) に移行
  const handleMigrateNames = useCallback(async () => {
    const hasLegacy = colorNames.some((n, i) => /^color\d+$/.test(n) && i < 6);
    if (!hasLegacy) return;
    const ok = await confirm({
      title: 'Rename to Semantic Names',
      message: 'color1/color2... を primary/secondary/success/warning/info/error に変更しますか？',
      confirmLabel: 'Rename',
      severity: 'warning',
    });
    if (!ok) return;
    setColorNames(prev => prev.map((n, i) => (/^color\d+$/.test(n) ? defaultColorName(i) : n)));
  }, [colorNames, confirm]);

  const handleFigmaConnect = useCallback((pat: string, fileKey: string) => {
    setFigmaPat(pat);
    setFigmaFileKey(fileKey);
  }, []);

  const handleFigmaImport = useCallback((variables: ParsedVariable[]) => {
    // action-colors / grey / utility コレクションのパス規約 (name/mode/shade) を
    // そのまま逆変換して MUI 5シェード構造に復元する。
    const restored = parsedVariablesToPalette(variables);

    if (restored.names && restored.names.length > 0 && restored.colors) {
      skipAutoResetRef.current = true;
      setNumColors(restored.numColors ?? restored.colors.length);
      setColor(restored.colors);
      setColorNames(restored.names);

      // 5シェード完全復元：palette state に流し込んで再計算を抑止
      if (restored.palette) {
        setPalette(restored.palette);
      }
    } else {
      // action-colors 規約に合致しない場合はフラットな色リストとして取り込む
      const flat = variables.filter(v => v.lightValue.startsWith('#')).slice(0, 24);
      if (flat.length === 0) return;
      skipAutoResetRef.current = true;
      setNumColors(flat.length);
      setColor(flat.map(v => v.lightValue));
      setColorNames(flat.map(v => v.name.replace(/\//g, '-')));
    }

    if (restored.themeTokens) {
      setThemeTokens(restored.themeTokens);
    }
  }, []);

  const handleFigmaExportConfirm = useCallback(async (): Promise<boolean> => {
    return confirm({
      title: 'Push to Figma',
      message: 'Figma Variables を上書きします。この操作は取り消せません。',
      confirmLabel: 'Push',
      severity: 'warning',
    });
  }, [confirm]);

  const handleFigmaImportConfirm = useCallback(async (): Promise<boolean> => {
    return confirm({
      title: 'Import from Figma',
      message: '現在のパレットが Figma の Variables で置き換えられます。',
      confirmLabel: 'Import',
      severity: 'warning',
    });
  }, [confirm]);

  const importFromJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target !== null) {
          const data = JSON.parse(e.target.result as string);
          setColor(data.colors);
          setColorNames(data.names);
          setPalette(data.palette);
          setNumColors(data.colors.length);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box
      sx={{
        // Generator chrome（ヘッダー/ツールバー/ページ背景）を color scheme に追従。
        // user palette (PaletteCard 内の色) はこの wrapper の影響を受けず自分の
        // 色で描画される。
        bgcolor: c.pageBg,
        color: c.textPrimary,
        minHeight: '100vh',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* ===== Header ===== */}
      <Box
        component='header'
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          pb: 2.5,
          borderBottom: `1px solid ${c.divider}`,
        }}
      >
        {/* Logo + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <LogoMark />
          <Box>
            <Typography
              component='h1'
              sx={{
                fontSize: '1.35rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: c.textPrimary,
                lineHeight: 1.2,
              }}
            >
              Palette Pally
            </Typography>
            <Typography
              sx={{
                fontSize: '0.65rem',
                color: c.textSubtle,
                fontWeight: 500,
                letterSpacing: '0.04em',
                lineHeight: 1,
                mt: 0.25,
              }}
            >
              MUI Color Palette Generator
            </Typography>
          </Box>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* カラー数 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              bgcolor: c.chromeBg,
              borderRadius: '8px',
              px: 1.25,
              py: 0.5,
              border: `1px solid ${c.divider}`,
            }}
          >
            <Typography
              component='label'
              htmlFor='color-length'
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: c.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              Colors
            </Typography>
            <TextField
              id='color-length'
              value={numColorsInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNumColorsInput(e.target.value);
              }}
              type='number'
              inputProps={{ min: 1, max: 24 }}
              size='small'
              sx={{
                width: 52,
                '& .MuiOutlinedInput-root': {
                  bgcolor: c.chromeBgActive,
                  borderRadius: '6px',
                  '& fieldset': { borderColor: c.divider },
                  '&:hover fieldset': { borderColor: c.borderHover },
                },
                '& input': {
                  py: 0.5,
                  px: 1,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textAlign: 'center',
                },
              }}
            />
          </Box>

          {/* Divider */}
          <Box sx={{ width: '1px', height: 24, bgcolor: c.divider }} />

          {/* Undo / Redo */}
          <Tooltip title='Undo (⌘Z)' arrow>
            <span>
              <IconButton
                onClick={undo}
                disabled={!canUndo}
                size='small'
                sx={{
                  width: 34, height: 34, borderRadius: '8px',
                  border: `1px solid ${c.border}`, bgcolor: c.chromeBg, color: c.textPrimary,
                  '&:hover': { bgcolor: c.chromeBgHover, borderColor: c.borderHover },
                  '&:disabled': { opacity: 0.4 },
                }}
              >
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M3 7v6h6' />
                  <path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' />
                </svg>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title='Redo (⌘⇧Z)' arrow>
            <span>
              <IconButton
                onClick={redo}
                disabled={!canRedo}
                size='small'
                sx={{
                  width: 34, height: 34, borderRadius: '8px',
                  border: `1px solid ${c.border}`, bgcolor: c.chromeBg, color: c.textPrimary,
                  '&:hover': { bgcolor: c.chromeBgHover, borderColor: c.borderHover },
                  '&:disabled': { opacity: 0.4 },
                }}
              >
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M21 7v6h-6' />
                  <path d='M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13' />
                </svg>
              </IconButton>
            </span>
          </Tooltip>

          {/* Action Buttons */}
          <Tooltip title='Reset all colors' arrow>
            <IconButton
              onClick={handleResetWithConfirm}
              aria-label='Reset all colors'
              size='small'
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                bgcolor: c.chromeBg,
                color: c.textPrimary,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: c.chromeBgHover,
                  borderColor: c.borderHover,
                },
              }}
            >
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
                <path d='M3 3v5h5' />
              </svg>
            </IconButton>
          </Tooltip>
          {/* TODO: Harmony / Compare ボタンは UX 説明不足のため一旦非表示
          <Tooltip title='Harmony Generator (complementary/triadic/...)' arrow>
            <Button
              variant='text'
              onClick={() => setHarmonyOpen(true)}
              size='small'
              sx={headerButtonSx}
            >
              Harmony
            </Button>
          </Tooltip>
          <Tooltip title='Compare with another palette' arrow>
            <Button
              variant='text'
              onClick={() => setCompareOpen(true)}
              size='small'
              sx={headerButtonSx}
            >
              Compare
            </Button>
          </Tooltip>
          */}

          <input
            ref={fileInputRef}
            type='file'
            accept='.json'
            onChange={importFromJson}
            style={{ display: 'none' }}
          />

          {/* Legacy name migration (表示条件: color1/color2 名が残っている) */}
          {colorNames.slice(0, 6).some(n => /^color\d+$/.test(n)) && (
            <>
              <Tooltip title='Rename color1/color2... to semantic names' arrow>
                <Button
                  variant='text'
                  onClick={handleMigrateNames}
                  size='small'
                  sx={{
                    ...headerButtonSx,
                    bgcolor: '#fef3c7',
                    borderColor: '#f59e0b',
                    color: '#92400e',
                    '&:hover': { bgcolor: '#fde68a', borderColor: '#d97706' },
                  }}
                >
                  Rename
                </Button>
              </Tooltip>
              <Box sx={{ width: '1px', height: 24, bgcolor: c.divider }} />
            </>
          )}

          {/* Contrast Mode Toggle */}
          <Tooltip title='Contrast text 戦略 (light mode のみ適用 / dark mode は常に A11y 自動選択)' arrow>
            <Box sx={{ display: 'flex', bgcolor: c.chromeBg, borderRadius: '8px', border: `1px solid ${c.divider}`, p: '2px' }}>
              {(['auto', 'white', 'black'] as ContrastMode[]).map(m => (
                <Box
                  key={m}
                  component='button'
                  onClick={() => setContrastMode(m)}
                  sx={{
                    border: 0,
                    px: 1.25,
                    py: 0.5,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    bgcolor: contrastMode === m ? c.chromeBgActive : 'transparent',
                    color: contrastMode === m ? c.textPrimary : c.textMuted,
                    boxShadow: contrastMode === m ? `0 1px 2px ${c.shadow}` : 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m === 'auto' ? 'A11y' : m === 'white' ? 'White' : 'Black'}
                </Box>
              ))}
            </Box>
          </Tooltip>

          {/* A11y Threshold Toggle */}
          <Tooltip title='A11y 許容しきい値（通常テキスト 14-16px 想定）: None (無効) / A (≥3:1, 大きい文字向け) / AA (≥4.5:1, WCAG 標準) / AAA (≥7:1, 強化)' arrow>
            <Box sx={{ display: 'flex', bgcolor: c.chromeBg, borderRadius: '8px', border: `1px solid ${c.divider}`, p: '2px' }}>
              {(['none', 'A', 'AA', 'AAA'] as A11yThreshold[]).map(t => (
                <Box
                  key={t}
                  component='button'
                  onClick={() => setA11yThreshold(t)}
                  sx={{
                    border: 0,
                    px: 1,
                    py: 0.5,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    bgcolor: a11yThreshold === t ? c.chromeBgActive : 'transparent',
                    color: a11yThreshold === t ? c.textPrimary : c.textMuted,
                    boxShadow: a11yThreshold === t ? `0 1px 2px ${c.shadow}` : 'none',
                    letterSpacing: '0.03em',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t === 'none' ? 'None' : t}
                </Box>
              ))}
            </Box>
          </Tooltip>

          {/* Divider */}
          <Box sx={{ width: '1px', height: 24, bgcolor: c.divider }} />

          {/* Navigation */}
          <Button
            variant='text'
            onClick={() => setExampleOpen(true)}
            size='small'
            sx={headerButtonSx}
          >
            Example
          </Button>
          <Tooltip title={greyscale ? 'Greyscale ON (click to disable)' : 'Greyscale mode (monochrome preview)'} arrow>
            <IconButton
              onClick={toggleGreyscale}
              size='small'
              sx={{
                width: 34, height: 34, borderRadius: '8px',
                border: `1px solid ${c.border}`,
                bgcolor: greyscale ? c.textPrimary : c.chromeBg,
                color: greyscale ? c.pageBg : c.textPrimary,
                '&:hover': { bgcolor: greyscale ? c.textPrimary : c.chromeBgHover, opacity: greyscale ? 0.85 : 1 },
              }}
            >
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <circle cx='12' cy='12' r='10' />
                <path d='M12 2a10 10 0 0 0 0 20z' fill='currentColor' />
              </svg>
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <Box sx={{ width: '1px', height: 24, bgcolor: c.divider }} />

          {/* Figma */}
          {figmaConnected ? (
            <>
              <Tooltip title='Import from Figma' arrow>
                <Button variant='text' onClick={() => setFigmaImportOpen(true)} size='small' sx={headerButtonSx}>
                  Figma Import
                </Button>
              </Tooltip>
              <Tooltip title='Push to Figma' arrow>
                <Button variant='text' onClick={() => setFigmaExportOpen(true)} size='small' sx={headerButtonSx}>
                  Figma Push
                </Button>
              </Tooltip>
            </>
          ) : (
            <Tooltip title='Connect Figma' arrow>
              <Button variant='text' onClick={() => setFigmaConnectOpen(true)} size='small' sx={headerButtonSx}>
                Figma
              </Button>
            </Tooltip>
          )}

          {/* Divider */}
          <Box sx={{ width: '1px', height: 24, bgcolor: c.divider }} />

          {/* Export / Import / Help (右端グループ) */}
          <Tooltip title='Export (JSON/DTCG/CSS/SCSS/MUI/Tailwind/MCP)' arrow>
            <Button
              variant='text'
              onClick={() => setExportHubOpen(true)}
              aria-label='Export palette'
              size='small'
              startIcon={
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                  <polyline points='7 10 12 15 17 10' />
                  <line x1='12' y1='15' x2='12' y2='3' />
                </svg>
              }
              sx={headerButtonSx}
            >
              Export
            </Button>
          </Tooltip>
          <Tooltip title='Import (JSON/DTCG/Tokens Studio)' arrow>
            <Button
              variant='text'
              onClick={() => setImportHubOpen(true)}
              aria-label='Import palette'
              size='small'
              startIcon={
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                  <polyline points='17 8 12 3 7 8' />
                  <line x1='12' y1='3' x2='12' y2='15' />
                </svg>
              }
              sx={headerButtonSx}
            >
              Import
            </Button>
          </Tooltip>
          <Button
            variant='text'
            onClick={() => setHelpOpen(true)}
            size='small'
            sx={headerButtonSx}
          >
            Help
          </Button>

          {/* App color scheme toggle (Light / Dark / System) */}
          <ColorSchemeToggle />

          {/* Divider */}
          <Box sx={{ width: '1px', height: 24, bgcolor: c.divider }} />

          {/* Cloud / Auth (Firebase 未設定時は非表示) */}
          {!firebaseReady ? null : user ? (
            <>
              <Tooltip title={currentPaletteId ? 'Update to cloud' : 'Save to cloud'} arrow>
                <Button
                  variant='text'
                  onClick={() => setSaveOpen(true)}
                  size='small'
                  sx={headerButtonSx}
                >
                  {currentPaletteId ? 'Update' : 'Save'}
                </Button>
              </Tooltip>
              {currentPaletteId && (
                <>
                  <Tooltip title='Share palette' arrow>
                    <Button
                      variant='text'
                      onClick={() => setShareOpen(true)}
                      size='small'
                      sx={headerButtonSx}
                    >
                      Share
                    </Button>
                  </Tooltip>
                  <Tooltip title='Version history' arrow>
                    <Button
                      variant='text'
                      onClick={() => setVersionOpen(true)}
                      size='small'
                      sx={headerButtonSx}
                    >
                      History
                    </Button>
                  </Tooltip>
                </>
              )}
              <UserMenu onOpenPalettes={() => setDrawerOpen(true)} />
            </>
          ) : (
            <Button
              variant='text'
              onClick={() => setLoginOpen(true)}
              size='small'
              sx={headerButtonSx}
            >
              Login
            </Button>
          )}
        </Box>
      </Box>

      {/* ===== Color Strip (horizontal scroll) ===== */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          overflowY: 'visible',
          pb: 2,
          mx: -3,
          px: 3,
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-track': { bgcolor: c.divider, borderRadius: 4 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: c.border,
            borderRadius: 4,
            '&:hover': { bgcolor: c.borderHover },
          },
        }}
      >
        {color.map((hex, index) => (
          <Box
            key={index}
            sx={{
              flex: '0 0 280px',
              minWidth: 280,
              scrollSnapAlign: 'start',
            }}
          >
            <TextField
              value={colorNames[index]}
              onChange={e => handleColorNameChange(index, e.target.value)}
              size='small'
              fullWidth
              aria-label={`Color ${index + 1} name`}
              placeholder={defaultColorName(index)}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: c.divider },
                  '&:hover fieldset': { borderColor: c.border },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3f50b5',
                    borderWidth: '2px',
                  },
                },
                '& input': {
                  py: 0.75,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                },
              }}
            />
            <ColorInputField
              color={hex}
              onChange={newColor => handleColorChange(index, newColor)}
            />
            {palette && palette[index] && (
              <Box sx={{ mt: 1.5 }}>
                <PaletteCard
                  colorPalette={palette[index][colorNames[index]]}
                  colorName={colorNames[index]}
                  a11yThreshold={a11yThreshold}
                  onEdit={(mode, shade, value) =>
                    handlePaletteEdit(index, mode, shade, value)
                  }
                />
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* ===== Theme Tokens (grey + utility) ===== */}
      {themeTokens && (
        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${c.divider}` }}>
          <Typography
            component='h2'
            sx={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: c.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 2,
            }}
          >
            Theme Tokens
            <Typography
              component='span'
              sx={{
                fontSize: '0.75rem',
                fontWeight: 400,
                color: c.textSubtle,
                ml: 1,
              }}
            >
              derived from {colorNames[0] ?? 'primary'}
            </Typography>
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'visible',
              pb: 2,
              mx: -3,
              px: 3,
              scrollSnapType: 'x proximity',
              scrollbarWidth: 'thin',
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-track': { bgcolor: c.divider, borderRadius: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: c.border,
                borderRadius: 4,
                '&:hover': { bgcolor: c.borderHover },
              },
            }}
          >
            <Box sx={{ flex: '0 0 280px', minWidth: 280, scrollSnapAlign: 'start' }}>
              <GreyScaleCard
                grey={themeTokens.grey}
                onUpdate={grey => setThemeTokens(prev => prev ? { ...prev, grey } : prev)}
              />
            </Box>
            {Object.keys(themeTokens.utility.light).map(groupName => (
              <Box key={groupName} sx={{ flex: '0 0 280px', minWidth: 280, scrollSnapAlign: 'start' }}>
                <UtilityGroupCard
                  groupName={groupName}
                  utility={themeTokens.utility}
                  onUpdate={utility => setThemeTokens(prev => prev ? { ...prev, utility } : prev)}
                />
              </Box>
            ))}
            <Box sx={{ flex: '0 0 280px', minWidth: 280, scrollSnapAlign: 'start' }}>
              <AddGroupCard
                utility={themeTokens.utility}
                onUpdate={utility => setThemeTokens(prev => prev ? { ...prev, utility } : prev)}
              />
            </Box>
          </Box>
        </Box>
      )}


      {/* ===== Cloud Dialogs ===== */}
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <SavePaletteDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={handleCloudSave}
        defaultName={currentPaletteName}
        isUpdate={!!currentPaletteId}
      />
      {user && (
        <PaletteListDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          uid={user.uid}
          onLoad={handleCloudLoad}
          onDelete={handleCloudDelete}
        />
      )}
      {currentPaletteId && (
        <>
          <ShareDialog
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            paletteId={currentPaletteId}
            paletteName={currentPaletteName}
            currentShareId={currentShareId}
            onRevoke={handleRevokeShare}
          />
          <PaletteVersionHistory
            open={versionOpen}
            onClose={() => setVersionOpen(false)}
            paletteId={currentPaletteId}
            paletteName={currentPaletteName}
            onRestore={handleVersionRestore}
          />
        </>
      )}
      {/* ===== Export / Import Hub ===== */}
      <ExportHubDialog
        open={exportHubOpen}
        onClose={() => setExportHubOpen(false)}
        paletteData={buildPaletteData()}
      />
      <ImportHubDialog
        open={importHubOpen}
        onClose={() => setImportHubOpen(false)}
        onImport={data => {
          if (data.colors && data.colors.length > 0) {
            setColor(data.colors);
            setNumColors(data.colors.length);
            setNumColorsInput(String(data.colors.length));
          }
          if (data.names) setColorNames(data.names);
          if (data.themeTokens) setThemeTokens(data.themeTokens);
        }}
        onConfirm={() => confirm({
          title: 'Import Palette',
          message: '現在のパレットを上書きしますか？',
          confirmLabel: 'Import',
          severity: 'warning',
        })}
      />

      {/* ===== Harmony Generator ===== */}
      <HarmonyDialog
        open={harmonyOpen}
        onClose={() => setHarmonyOpen(false)}
        baseColor={color[0] ?? '#1976d2'}
        count={numColors}
        onApply={newColors => setColor(newColors)}
      />

      {/* ===== Compare ===== */}
      <CompareDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        current={buildPaletteData()}
      />

      {/* ===== Help Dialog ===== */}
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* ===== Example Dialog (現在のパレットを即時反映) ===== */}
      <ExampleDialog
        open={exampleOpen}
        onClose={() => setExampleOpen(false)}
        paletteData={buildPaletteData()}
      />

      {/* ===== Figma Dialogs ===== */}
      <FigmaConnectDialog
        open={figmaConnectOpen}
        onClose={() => setFigmaConnectOpen(false)}
        onConnect={handleFigmaConnect}
        savedPat={figmaPat}
        savedFileKey={figmaFileKey}
      />
      {figmaConnected && (
        <>
          <FigmaExportDialog
            open={figmaExportOpen}
            onClose={() => setFigmaExportOpen(false)}
            paletteData={buildPaletteData()}
            fileKey={figmaFileKey}
            pat={figmaPat}
            onConfirm={handleFigmaExportConfirm}
          />
          <FigmaImportDialog
            open={figmaImportOpen}
            onClose={() => setFigmaImportOpen(false)}
            fileKey={figmaFileKey}
            pat={figmaPat}
            onImport={handleFigmaImport}
            onConfirm={handleFigmaImportConfirm}
          />
        </>
      )}

      <ConfirmDialog
        state={confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
}

export default ColorPicker;

import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import chroma from 'chroma-js';
import ColorInputField from './ColorInputField';
import { PaletteCard } from './PaletteGrid';
import { GreyScaleCard, UtilityGroupCard } from './ThemeTokenCards';
import { ConfirmDialog } from './common/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAuthContext } from './auth/AuthProvider';
import { LoginDialog } from './auth/LoginDialog';
import { UserMenu } from './auth/UserMenu';
import { SavePaletteDialog } from './palette/SavePaletteDialog';
import { PaletteListDrawer } from './palette/PaletteListDrawer';
import { ShareDialog } from './palette/ShareDialog';
import { PaletteVersionHistory } from './palette/PaletteVersionHistory';
import DialogBox from './DialogBox';
import { downloadJSON } from './utils';
import { generateColorScheme, generateThemeTokens, ColorPalette, MuiColorVariant, ThemeTokens } from './colorUtils';
import { PaletteData, PaletteDocument } from '@/lib/types/palette';
import { ParsedVariable } from '@/lib/figma/types';
import { FigmaConnectDialog } from './figma/FigmaConnectDialog';
import { FigmaExportDialog } from './figma/FigmaExportDialog';
import { FigmaImportDialog } from './figma/FigmaImportDialog';
import * as firestoreService from '@/lib/firebase/firestore';

// "P" ロゴ: 文字 P + 仲間たちのカラフルドット (pally = party/friends)
const LogoMark = () => (
  <svg width='40' height='40' viewBox='0 0 40 40' fill='none'>
    <defs>
      <linearGradient id='pally-p' x1='8' y1='6' x2='32' y2='34' gradientUnits='userSpaceOnUse'>
        <stop offset='0' stopColor='#7B6BC4' />
        <stop offset='0.6' stopColor='#4A90D9' />
        <stop offset='1' stopColor='#3EBD6E' />
      </linearGradient>
    </defs>
    {/* 周りの仲間ドット */}
    <circle cx='33' cy='6' r='3.5' fill='#E07A5F' />
    <circle cx='36' cy='19' r='2.5' fill='#F2C94C' />
    <circle cx='5' cy='33' r='3' fill='#3EBD6E' />
    <circle cx='22' cy='37' r='2.5' fill='#E07A5F' />
    {/* 文字 P */}
    <path
      d='M 8 5 L 8 35 L 13 35 L 13 24 L 21 24 C 28 24, 33 19.5, 33 14.5 C 33 9.5, 28 5, 21 5 Z M 13 10 L 21 10 C 24.5 10, 27.5 12, 27.5 14.5 C 27.5 17, 24.5 19, 21 19 L 13 19 Z'
      fill='url(#pally-p)'
    />
  </svg>
);

// ヘッダーボタンの共通スタイル
const headerButtonSx = {
  minWidth: 0,
  px: 1.5,
  py: 0.625,
  borderRadius: '8px',
  border: '1px solid rgba(0,0,0,0.12)',
  bgcolor: '#f5f5f5',
  color: '#1a1a2e',
  fontSize: '0.72rem',
  fontWeight: 600,
  textTransform: 'none' as const,
  letterSpacing: '0.01em',
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: '#eaeaea',
    borderColor: 'rgba(0,0,0,0.2)',
  },
};

function ColorPicker() {
  const { user, firebaseReady } = useAuthContext();
  const { state: confirmState, confirm, handleConfirm, handleCancel } = useConfirmDialog();

  // Cloud state
  const [loginOpen, setLoginOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [currentPaletteId, setCurrentPaletteId] = useState<string | null>(null);
  const [currentPaletteName, setCurrentPaletteName] = useState('');
  const [currentShareId, setCurrentShareId] = useState<string | null>(null);

  // Figma state
  const [figmaConnectOpen, setFigmaConnectOpen] = useState(false);
  const [figmaExportOpen, setFigmaExportOpen] = useState(false);
  const [figmaImportOpen, setFigmaImportOpen] = useState(false);
  const [figmaPat, setFigmaPat] = useState('');
  const [figmaFileKey, setFigmaFileKey] = useState('');
  const figmaConnected = Boolean(figmaPat && figmaFileKey);

  const [numColors, setNumColors] = useState(4);
  const [numColorsInput, setNumColorsInput] = useState('4');
  const [color, setColor] = useState<string[]>([]);
  const [palette, setPalette] = useState<
    { [colorName: string]: ColorPalette }[] | null
  >(null);
  const [colorNames, setColorNames] = useState(
    Array.from({ length: numColors }, (_, i) => `color${i + 1}`)
  );

  const [themeTokens, setThemeTokens] = useState<ThemeTokens | null>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
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
            (_, i) => `color${prev.length + i + 1}`
          ),
        ];
      }
      return numColors < prev.length ? prev.slice(0, numColors) : prev;
    });
  }, [numColors]);

  const handleReset = useCallback(() => {
    skipAutoResetRef.current = false;
    const initialColors = Array.from({ length: numColors }, (_, i) => {
      const hue = i * (360 / numColors);
      return chroma.hsl(hue, 0.8, 0.5).hex();
    });
    setColor(initialColors);
    setColorNames(Array.from({ length: numColors }, (_, i) => `color${i + 1}`));
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
        setColorNames(data.names ?? data.colors.map((_: string, i: number) => `color${i + 1}`));
        if (data.themeTokens) {
          setThemeTokens(data.themeTokens);
          // 復元済みトークンが primary useEffect で上書きされるのを防ぐ
          prevPrimaryRef.current = data.colors[0];
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
      }));
    }, 300);
    return () => clearTimeout(timer);
  }, [numColors, color, colorNames, themeTokens]);

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
      [colorNames[idx]]: generateColorScheme(c),
    }));
    setPalette(newPalette);
  }, [color, colorNames]);

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
  }, [primaryColor]); // themeTokens を deps に入れない（手動編集時の再生成を防ぐ）

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

  const handleResetWithConfirm = useCallback(async () => {
    const ok = await confirm({
      title: 'Reset All Colors',
      message: '全てのカラーを初期状態にリセットしますか？',
      confirmLabel: 'Reset',
      severity: 'warning',
    });
    if (ok) handleReset();
  }, [confirm, handleReset]);

  const handleFigmaConnect = useCallback((pat: string, fileKey: string) => {
    setFigmaPat(pat);
    setFigmaFileKey(fileKey);
  }, []);

  const handleFigmaImport = useCallback((variables: ParsedVariable[]) => {
    // Group variables by collection/path into palette-compatible structure
    const imported = variables.filter(v => v.lightValue.startsWith('#'));
    if (imported.length === 0) return;

    const newColors = imported.slice(0, 24).map(v => v.lightValue);
    const newNames = imported.slice(0, 24).map(v => v.name.replace(/\//g, '-'));
    setNumColors(newColors.length);
    setColor(newColors);
    setColorNames(newNames);
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

  const exportToJson = () => {
    const data = { colors: color, names: colorNames, palette, themeTokens };
    setDialogContent(JSON.stringify(data, null, 2));
    setShowDialog(true);
  };

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
    <>
      {/* ===== Header ===== */}
      <Box
        component='header'
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          pb: 2.5,
          borderBottom: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
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
                color: '#1a1a2e',
                lineHeight: 1.2,
              }}
            >
              Palette Pally
            </Typography>
            <Typography
              sx={{
                fontSize: '0.65rem',
                color: 'rgba(0,0,0,0.35)',
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
              bgcolor: '#f5f5f5',
              borderRadius: '8px',
              px: 1.25,
              py: 0.5,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Typography
              component='label'
              htmlFor='color-length'
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'rgba(0,0,0,0.5)',
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
                  bgcolor: '#fff',
                  borderRadius: '6px',
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
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
          <Box sx={{ width: '1px', height: 24, bgcolor: 'rgba(0,0,0,0.1)' }} />

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
                border: '1px solid rgba(0,0,0,0.12)',
                bgcolor: '#f5f5f5',
                color: '#1a1a2e',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#eaeaea',
                  borderColor: 'rgba(0,0,0,0.2)',
                },
              }}
            >
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
                <path d='M3 3v5h5' />
              </svg>
            </IconButton>
          </Tooltip>

          <Tooltip title='Export as JSON' arrow>
            <Button
              variant='text'
              onClick={exportToJson}
              aria-label='Export palette as JSON'
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

          <Tooltip title='Import JSON file' arrow>
            <Button
              variant='text'
              onClick={() => fileInputRef.current?.click()}
              aria-label='Import JSON file'
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
          <input
            ref={fileInputRef}
            type='file'
            accept='.json'
            onChange={importFromJson}
            style={{ display: 'none' }}
          />

          {/* Divider */}
          <Box sx={{ width: '1px', height: 24, bgcolor: 'rgba(0,0,0,0.1)' }} />

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
          <Box sx={{ width: '1px', height: 24, bgcolor: 'rgba(0,0,0,0.1)' }} />

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

      {/* ===== Color Grid ===== */}
      <Grid container spacing={2}>
        {color.map((c, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <TextField
              value={colorNames[index]}
              onChange={e => handleColorNameChange(index, e.target.value)}
              size='small'
              fullWidth
              aria-label={`Color ${index + 1} name`}
              placeholder={`color${index + 1}`}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
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
              color={c}
              onChange={newColor => handleColorChange(index, newColor)}
            />
            {palette && palette[index] && (
              <Box sx={{ mt: 1.5 }}>
                <PaletteCard
                  colorPalette={palette[index][colorNames[index]]}
                  colorName={colorNames[index]}
                  onEdit={(mode, shade, value) =>
                    handlePaletteEdit(index, mode, shade, value)
                  }
                />
              </Box>
            )}
          </Grid>
        ))}
      </Grid>

      {/* ===== Theme Tokens (grey + utility) ===== */}
      {themeTokens && (
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Typography
            component='h2'
            sx={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'rgba(0,0,0,0.5)',
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
                color: 'rgba(0,0,0,0.3)',
                ml: 1,
              }}
            >
              derived from {colorNames[0] ?? 'primary'}
            </Typography>
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <GreyScaleCard
                grey={themeTokens.grey}
                onUpdate={grey => setThemeTokens(prev => prev ? { ...prev, grey } : prev)}
              />
            </Grid>
            {Object.keys(themeTokens.utility.light).map(groupName => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={groupName}>
                <UtilityGroupCard
                  groupName={groupName}
                  utility={themeTokens.utility}
                  onUpdate={utility => setThemeTokens(prev => prev ? { ...prev, utility } : prev)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <DialogBox
        showDialog={showDialog}
        closeDialog={() => setShowDialog(false)}
        dialogContent={dialogContent}
        downloadJSON={() => downloadJSON(JSON.parse(dialogContent))}
      />

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
    </>
  );
}

export default ColorPicker;

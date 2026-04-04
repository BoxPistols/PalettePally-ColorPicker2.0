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
import { GreyScaleCard, UtilityTokensCard } from './ThemeTokenCards';
import DialogBox from './DialogBox';
import { downloadJSON } from './utils';
import { generateColorScheme, generateThemeTokens, ColorPalette, MuiColorVariant, ThemeTokens } from './colorUtils';

// バウハウス風ロゴ: 多色ドットの構造的配置
const LogoMark = () => (
  <svg width='36' height='36' viewBox='0 0 36 36' fill='none'>
    {/* 4色ドット — バウハウス的幾何学配置 */}
    <circle cx='11' cy='11' r='7' fill='#7B6BC4' />
    <circle cx='25' cy='9' r='5.5' fill='#4A90D9' />
    <circle cx='9' cy='25' r='5' fill='#E07A5F' />
    <circle cx='23' cy='24' r='6' fill='#3EBD6E' />
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
  const [numColors, setNumColors] = useState(4);
  const [color, setColor] = useState<string[]>([]);
  const [palette, setPalette] = useState<
    { [colorName: string]: ColorPalette }[] | null
  >(null);
  const [colorNames, setColorNames] = useState(
    Array.from({ length: numColors }, (_, i) => `color${i + 1}`)
  );

  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const skipAutoResetRef = useRef(false);

  const isValidHex = (hex: never) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

  // numColors 変更時のみ色を増減（functional setState でカスケード防止）
  useEffect(() => {
    setColor(prev => {
      if (numColors > prev.length) {
        const result = [...prev];
        for (let i = prev.length; i < numColors; i++) {
          result.push(generateDistinctColor(result));
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
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (skipAutoResetRef.current) return;
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
      }));
    }, 300);
    return () => clearTimeout(timer);
  }, [numColors, color, colorNames]);

  function generateDistinctColor(existingColors: string[]): string {
    const count = existingColors.length;
    const minGap = Math.max(5, Math.floor(300 / Math.max(count, 1)));
    let bestHue = Math.floor(Math.random() * 360);
    let bestDist = 0;

    for (let attempt = 0; attempt < 200; attempt++) {
      const hue = Math.floor(Math.random() * 360);
      let nearest = 360;
      for (const c of existingColors) {
        try {
          const h = chroma(c).hsl()[0] || 0;
          const diff = Math.abs(h - hue);
          nearest = Math.min(nearest, diff, 360 - diff);
        } catch { /* skip */ }
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
  const [themeTokens, setThemeTokens] = useState<ThemeTokens | null>(null);
  const primaryColor = color.length > 0 ? color[0] : undefined;
  useEffect(() => {
    if (!primaryColor) return;
    setThemeTokens(generateThemeTokens(primaryColor));
  }, [primaryColor]);

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
              value={numColors}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num) && num > 0) setNumColors(num);
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
              onClick={() => handleReset()}
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <UtilityTokensCard
                utility={themeTokens.utility}
                onUpdate={utility => setThemeTokens(prev => prev ? { ...prev, utility } : prev)}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      <DialogBox
        showDialog={showDialog}
        closeDialog={() => setShowDialog(false)}
        dialogContent={dialogContent}
        downloadJSON={() => downloadJSON(JSON.parse(dialogContent))}
      />
    </>
  );
}

export default ColorPicker;

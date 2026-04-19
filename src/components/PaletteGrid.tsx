import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import chroma from 'chroma-js';
import { ColorPalette, MuiColorVariant } from './colorUtils';
import { contrastRatio, wcagLevel, WCAG_COLOR, A11yThreshold, THRESHOLD_RATIO, meetsThreshold } from '@/lib/wcag';

const THRESHOLD_LABEL: Record<A11yThreshold, string> = {
  none: '—',
  A: `${THRESHOLD_RATIO.A}:1`,
  AA: `${THRESHOLD_RATIO.AA}:1`,
  AAA: `${THRESHOLD_RATIO.AAA}:1`,
};

type PaletteCardProps = {
  colorPalette: ColorPalette;
  colorName: string;
  a11yThreshold?: A11yThreshold;
  onEdit?: (mode: 'light' | 'dark', shade: keyof MuiColorVariant, value: string) => void;
};

const SHADE_KEYS: (keyof MuiColorVariant)[] = [
  'main',
  'dark',
  'light',
  'lighter',
  'contrastText',
];

const SHADE_LABELS: Record<keyof MuiColorVariant, string> = {
  main: 'main',
  dark: 'dark',
  light: 'light',
  lighter: 'lighter',
  contrastText: 'contrast',
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

const isValidHex = (hex: string) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

// ── Read-only Swatch (click to copy) ──

const ColorSwatch = memo<{
  shade: keyof MuiColorVariant;
  colorValue: string;
  mainColor: string;
  isDark: boolean;
  onCopy: (text: string) => void;
}>(({ shade, colorValue, mainColor, isDark, onCopy }) => {
  const isLight = shade === 'light';
  const isContrast = shade === 'contrastText';
  // main/dark/light/lighter は背景が独立しているため、各シェードごとに
  // 輝度ベースで文字色を決定する（contrastText を一律使うと低コントラスト化する）。
  // contrastText 行だけは main 背景に contrastText を重ねた実運用プレビュー。
  const swatchBg = isContrast ? mainColor : colorValue;
  const swatchFg = isContrast
    ? colorValue
    : chroma(colorValue).luminance() > 0.35
      ? 'rgba(0,0,0,0.85)'
      : 'rgba(255,255,255,0.95)';

  return (
    <Box
      onClick={() => onCopy(colorValue)}
      title={`${shade}: ${colorValue} — click to copy`}
      sx={{
        background: swatchBg,
        borderRadius: '6px',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        color: swatchFg,
        mb: 0.5,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        cursor: 'pointer',
        border: isLight || isContrast
          ? `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`
          : '1.5px solid transparent',
        boxShadow:
          shade === 'main'
            ? '0 2px 6px rgba(0,0,0,0.12)'
            : '0 1px 2px rgba(0,0,0,0.06)',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
        },
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <Box
        px={1}
        py={shade === 'main' ? 1 : 0.625}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 0,
        }}
      >
        <Box
          component='span'
          sx={{
            fontWeight: shade === 'main' ? 700 : 500,
            fontSize: shade === 'main' ? '0.8rem' : '0.75rem',
            flexShrink: 0,
          }}
        >
          {SHADE_LABELS[shade]}
        </Box>
        <Box
          component='span'
          sx={{
            opacity: 0.85,
            fontSize: '0.75rem',
            fontWeight: 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {colorValue}
        </Box>
      </Box>
    </Box>
  );
});

ColorSwatch.displayName = 'ColorSwatch';

// ── Contrast Preview (main 背景に contrastText を重ねた実運用サンプル) ──

const ContrastPreview = memo<{
  variant: MuiColorVariant;
  isDark: boolean;
  threshold: A11yThreshold;
}>(({ variant, isDark, threshold }) => {
  const ct = variant.contrastText;
  const bg = variant.main;
  const pageBg = isDark ? '#121212' : '#fafafa';

  // 2 ケースのコントラスト比と level
  const ratio1 = contrastRatio(ct, bg);
  const level1 = wcagLevel(ratio1);
  const ratio2 = contrastRatio(bg, pageBg);
  const level2 = wcagLevel(ratio2);

  const thresholdActive = threshold !== 'none';
  const pass1 = !thresholdActive || meetsThreshold(ratio1, threshold);
  const pass2 = !thresholdActive || meetsThreshold(ratio2, threshold);
  const anyFail = thresholdActive && (!pass1 || !pass2);

  const failColor = WCAG_COLOR.Fail;
  const neutralBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const makeTitle = (fg: string, bgHex: string, r: number, lvl: string, pass: boolean, label: string) =>
    `${label}\n文字色: ${fg}\n背景色: ${bgHex}\nコントラスト比: ${r.toFixed(2)}:1 (${lvl})\n` +
    (thresholdActive
      ? (pass ? `✓ ${threshold} 基準 (${THRESHOLD_LABEL[threshold]}) を満たしています`
              : `✗ ${threshold} 基準 (${THRESHOLD_LABEL[threshold]}) 未満です`)
      : 'しきい値: none (チェック無効)');

  return (
    <Box
      sx={{
        mt: 0.75,
        p: 0.75,
        borderRadius: '8px',
        border: anyFail ? '1.5px solid' : '1px dashed',
        borderColor: anyFail ? failColor : neutralBorder,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.5 }}>
        <Typography
          sx={{
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
          }}
        >
          Preview
        </Typography>
        {thresholdActive && (
          <Tooltip
            arrow
            placement='top'
            title={anyFail
              ? `いずれかのケースが ${threshold} 基準 (${THRESHOLD_LABEL[threshold]}) 未満です`
              : `両ケースとも ${threshold} 基準 (${THRESHOLD_LABEL[threshold]}) を満たしています`}
          >
            <Typography
              sx={{
                fontSize: '0.55rem',
                fontWeight: 700,
                letterSpacing: 0.4,
                color: anyFail ? failColor : WCAG_COLOR.AAA,
                px: 0.5,
                py: 0.125,
                borderRadius: '4px',
                border: `1px solid ${anyFail ? failColor : WCAG_COLOR.AAA}`,
                lineHeight: 1.3,
                cursor: 'help',
              }}
            >
              {anyFail ? `✗ ${threshold}` : `✓ ${threshold}`}
            </Typography>
          </Tooltip>
        )}
      </Box>

      {/* 枠 1: bg=main / fg=contrastText — 通常使用ケース */}
      <Tooltip
        arrow
        placement='left'
        title={<Box sx={{ whiteSpace: 'pre-line', fontSize: '0.75rem' }}>{
          makeTitle(ct, bg, ratio1, level1, pass1, 'main 背景 + contrastText 文字')
        }</Box>}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 0.5,
            background: bg,
            borderRadius: '6px',
            px: 0.75,
            py: 0.75,
            minWidth: 0,
            outline: thresholdActive && !pass1 ? `2px solid ${failColor}` : 'none',
            outlineOffset: thresholdActive && !pass1 ? '-2px' : 0,
            cursor: 'help',
          }}
        >
          <Box
            component='span'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              border: `1px solid ${ct}`,
              color: ct,
              borderRadius: '999px',
              fontSize: '0.65rem',
              fontWeight: 600,
              px: 0.75,
              py: 0.125,
              lineHeight: 1.4,
              flexShrink: 0,
            }}
          >
            text
          </Box>
          <Box
            component='span'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              fontSize: '0.65rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: thresholdActive && !pass1 ? failColor : ct,
              opacity: thresholdActive && !pass1 ? 1 : 0.85,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {thresholdActive && !pass1 ? '⚠ ' : ''}{ratio1.toFixed(1)} {level1}
          </Box>
        </Box>
      </Tooltip>

      {/* 枠 2: main を純粋な text color として使うケース（背景はサイト/カラム背景のまま） */}
      <Tooltip
        arrow
        placement='left'
        title={<Box sx={{ whiteSpace: 'pre-line', fontSize: '0.75rem' }}>{
          makeTitle(bg, pageBg, ratio2, level2, pass2, `main をテキスト色として使うケース（ページ背景 ${pageBg}）`)
        }</Box>}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 0.5,
            background: 'transparent',
            borderRadius: '6px',
            px: 0.75,
            py: 0.5,
            minWidth: 0,
            outline: thresholdActive && !pass2 ? `2px solid ${failColor}` : 'none',
            outlineOffset: thresholdActive && !pass2 ? '-2px' : 0,
            cursor: 'help',
          }}
        >
          <Typography
            sx={{
              color: bg,
              fontSize: '0.8rem',
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            main text
          </Typography>
          <Box
            component='span'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              fontSize: '0.65rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: thresholdActive && !pass2 ? failColor : bg,
              opacity: thresholdActive && !pass2 ? 1 : 0.85,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {thresholdActive && !pass2 ? '⚠ ' : ''}{ratio2.toFixed(1)} {level2}
          </Box>
        </Box>
      </Tooltip>
    </Box>
  );
});
ContrastPreview.displayName = 'ContrastPreview';

// ── Scheme Column (light / dark) ──

const SchemeColumn = memo<{
  variant: MuiColorVariant;
  mode: 'light' | 'dark';
  a11yThreshold: A11yThreshold;
  onCopy: (text: string) => void;
}>(({ variant, mode, a11yThreshold, onCopy }) => {
  const isDark = mode === 'dark';

  const handleCopyGroup = useCallback(() => {
    const data = SHADE_KEYS.reduce(
      (acc, key) => ({ ...acc, [key]: variant[key] }),
      {}
    );
    onCopy(JSON.stringify(data, null, 2));
  }, [variant, onCopy]);

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        bgcolor: isDark ? '#121212' : '#fafafa',
        borderRadius: '10px',
        p: 1,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      }}
    >
      <Typography
        variant='caption'
        onClick={handleCopyGroup}
        title='Click to copy all colors'
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)',
          display: 'block',
          mb: 0.75,
          cursor: 'pointer',
          '&:hover': {
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
          },
        }}
      >
        {mode}
      </Typography>
      {SHADE_KEYS.map(shade => (
        <ColorSwatch
          key={shade}
          shade={shade}
          colorValue={variant[shade]}
          mainColor={variant.main}
          isDark={isDark}
          onCopy={onCopy}
        />
      ))}

      {/* contrastText を実運用シーンで確認するためのサンプル（ボタン / テキスト） */}
      <ContrastPreview variant={variant} isDark={isDark} threshold={a11yThreshold} />
    </Box>
  );
});

SchemeColumn.displayName = 'SchemeColumn';

// ── Edit Cell (color picker + hex input) ──

const EditCell = memo<{
  value: string;
  onChange: (value: string) => void;
}>(({ value, onChange }) => {
  const [hex, setHex] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHex(value);
  }, [value]);

  const commit = () => {
    const v = hex.startsWith('#') ? hex : `#${hex}`;
    if (isValidHex(v)) {
      onChange(v);
    } else {
      setHex(value);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        component='input'
        type='color'
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        sx={{
          width: 32,
          height: 32,
          p: 0,
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: '6px',
          cursor: 'pointer',
          flexShrink: 0,
          '&::-webkit-color-swatch-wrapper': { p: '2px' },
          '&::-webkit-color-swatch': {
            border: 'none',
            borderRadius: '4px',
          },
        }}
      />
      <Box
        component='input'
        ref={inputRef}
        value={hex}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setHex(e.target.value)
        }
        onBlur={commit}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') commit();
        }}
        sx={{
          flex: 1,
          minWidth: 0,
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.15)',
          borderRadius: '6px',
          color: '#1a1a2e',
          fontSize: '0.85rem',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          px: 1,
          py: 0.75,
          outline: 'none',
          '&:focus': {
            borderColor: '#3f50b5',
            boxShadow: '0 0 0 2px rgba(63,80,181,0.15)',
          },
        }}
      />
    </Box>
  );
});
EditCell.displayName = 'EditCell';

// ── WCAG Contrast Badge ──

const WcagBadge = memo<{ ratio: number }>(({ ratio }) => {
  const level = wcagLevel(ratio);
  const color = WCAG_COLOR[level];
  return (
    <Tooltip title={`${ratio.toFixed(2)}:1 — ${level}`} arrow placement='top'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          py: 0.5,
          borderRadius: '6px',
          bgcolor: `${color}1a`,
          border: `1px solid ${color}`,
          cursor: 'help',
        }}
      >
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color, lineHeight: 1, fontFamily: 'monospace' }}>
          {ratio.toFixed(1)}
        </Typography>
        <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, color, lineHeight: 1, letterSpacing: 0.3 }}>
          {level}
        </Typography>
      </Box>
    </Tooltip>
  );
});
WcagBadge.displayName = 'WcagBadge';

// ── Edit Dialog ──

const EditDialog = memo<{
  open: boolean;
  onClose: () => void;
  colorName: string;
  colorPalette: ColorPalette;
  onEdit: (mode: 'light' | 'dark', shade: keyof MuiColorVariant, value: string) => void;
}>(({ open, onClose, colorName, colorPalette, onEdit }) => {
  const mainColor = colorPalette.light.main;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', overflow: 'hidden' },
      }}
    >
      <DialogTitle
        sx={{
          background: mainColor,
          color: chroma(mainColor).luminance() > 0.35 ? '#000' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2.5,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
          {colorName}
        </Typography>
        <IconButton
          onClick={onClose}
          size='small'
          sx={{
            color: 'inherit',
            bgcolor: 'rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          }}
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <polyline points='20 6 9 17 4 12' />
          </svg>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 56px 1fr 56px',
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          {/* Header */}
          <Box />
          <Typography
            sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(0,0,0,0.4)' }}
          >
            Light
          </Typography>
          <Typography
            sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(0,0,0,0.35)', textAlign: 'center' }}
          >
            WCAG
          </Typography>
          <Typography
            sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(0,0,0,0.4)' }}
          >
            Dark
          </Typography>
          <Typography
            sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(0,0,0,0.35)', textAlign: 'center' }}
          >
            WCAG
          </Typography>

          {/* Rows */}
          {SHADE_KEYS.map(shade => {
            const lightBg = colorPalette.light[shade];
            const darkBg = colorPalette.dark[shade];
            const lightRatio = contrastRatio(colorPalette.light.contrastText, lightBg);
            const darkRatio = contrastRatio(colorPalette.dark.contrastText, darkBg);
            return (
              <React.Fragment key={shade}>
                <Typography
                  sx={{ fontWeight: 600, fontSize: '0.8rem', fontFamily: '"JetBrains Mono", "Fira Code", monospace', color: '#1a1a2e' }}
                >
                  {SHADE_LABELS[shade]}
                </Typography>
                <EditCell value={lightBg} onChange={v => onEdit('light', shade, v)} />
                <WcagBadge ratio={lightRatio} />
                <EditCell value={darkBg} onChange={v => onEdit('dark', shade, v)} />
                <WcagBadge ratio={darkRatio} />
              </React.Fragment>
            );
          })}
        </Box>
        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.45)', mt: 2, textAlign: 'center' }}>
          Contrast ratio with contrastText · AAA ≥ 7 · AA ≥ 4.5 · AA-Large ≥ 3
        </Typography>
      </DialogContent>
    </Dialog>
  );
});
EditDialog.displayName = 'EditDialog';

// ── Palette Card ──

export const PaletteCard = memo<PaletteCardProps>(
  ({ colorPalette, colorName, a11yThreshold = 'none', onEdit }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [copiedText, setCopiedText] = useState('');

    const handleCopy = useCallback((text: string) => {
      copyToClipboard(text);
      setCopiedText(text.length > 20 ? 'Group copied!' : text);
      setSnackOpen(true);
    }, []);

    const handleCopyAll = useCallback(() => {
      if (!colorPalette) return;
      const data = {
        [colorName]: {
          light: SHADE_KEYS.reduce(
            (acc, key) => ({ ...acc, [key]: colorPalette.light[key] }),
            {}
          ),
          dark: SHADE_KEYS.reduce(
            (acc, key) => ({ ...acc, [key]: colorPalette.dark[key] }),
            {}
          ),
        },
      };
      handleCopy(JSON.stringify(data, null, 2));
    }, [colorPalette, colorName, handleCopy]);

    if (!colorPalette) return null;

    const mainColor = colorPalette.light.main;
    const headerTextColor =
      chroma(mainColor).luminance() > 0.35 ? '#000' : '#fff';

    return (
      <Box
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.08)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          },
        }}
      >
        {/* ヘッダー */}
        <Box
          sx={{
            background: mainColor,
            px: 1.5,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant='subtitle2'
            onClick={handleCopyAll}
            title='Click to copy all variants'
            sx={{
              fontWeight: 700,
              color: headerTextColor,
              fontSize: '0.8rem',
              letterSpacing: 0.3,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
          >
            {colorName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              variant='caption'
              onClick={handleCopyAll}
              title='Click to copy all variants'
              sx={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                color:
                  chroma(mainColor).luminance() > 0.35
                    ? 'rgba(0,0,0,0.4)'
                    : 'rgba(255,255,255,0.5)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {mainColor}
            </Typography>
            {onEdit && (
              <Box
                component='button'
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setDialogOpen(true);
                }}
                title='Edit colors'
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  p: 0,
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  borderRadius: '6px',
                  bgcolor: 'transparent',
                  color: headerTextColor,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                }}
              >
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
                  <path d='m15 5 4 4' />
                </svg>
              </Box>
            )}
          </Box>
        </Box>

        {/* Light / Dark */}
        <Box sx={{ display: 'flex', gap: 0.75, p: 1, bgcolor: '#fff' }}>
          <SchemeColumn
            variant={colorPalette.light}
            mode='light'
            a11yThreshold={a11yThreshold}
            onCopy={handleCopy}
          />
          <SchemeColumn
            variant={colorPalette.dark}
            mode='dark'
            a11yThreshold={a11yThreshold}
            onCopy={handleCopy}
          />
        </Box>

        {/* Edit Dialog */}
        {onEdit && (
          <EditDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            colorName={colorName}
            colorPalette={colorPalette}
            onEdit={onEdit}
          />
        )}

        <Snackbar
          open={snackOpen}
          autoHideDuration={1200}
          onClose={() => setSnackOpen(false)}
          message={`Copied: ${copiedText}`}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    );
  }
);

PaletteCard.displayName = 'PaletteCard';

export default PaletteCard;

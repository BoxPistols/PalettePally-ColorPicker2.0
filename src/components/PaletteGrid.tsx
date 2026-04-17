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
import { contrastRatio, wcagLevel, WCAG_COLOR } from '@/lib/wcag';

type PaletteCardProps = {
  colorPalette: ColorPalette;
  colorName: string;
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
  contrastText: string;
  isDark: boolean;
  onCopy: (text: string) => void;
}>(({ shade, colorValue, mainColor, contrastText, isDark, onCopy }) => {
  const isLight = shade === 'light';
  const isContrast = shade === 'contrastText';
  // contrastText は文字色として使う色。スウォッチでは main 背景に重ねて実運用と同じ見え方にする
  const swatchBg = isContrast ? mainColor : colorValue;
  const swatchFg = isContrast ? colorValue : contrastText;

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

// ── Contrast Preview (text + buttons on each shade) ──

const PREVIEW_SHADES: (keyof MuiColorVariant)[] = ['main', 'dark', 'light', 'lighter'];

const ContrastPreview = memo<{
  variant: MuiColorVariant;
  isDark: boolean;
}>(({ variant, isDark }) => {
  const ct = variant.contrastText;

  return (
    <Box
      sx={{
        mt: 0.75,
        p: 0.75,
        borderRadius: '8px',
        border: '1px dashed',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
          mb: 0.25,
        }}
      >
        contrastText preview
      </Typography>
      {PREVIEW_SHADES.map(shade => {
        const bg = variant[shade];
        const ratio = contrastRatio(ct, bg);
        const level = wcagLevel(ratio);
        return (
          <Box
            key={shade}
            sx={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr auto',
              alignItems: 'center',
              gap: 0.5,
              background: bg,
              borderRadius: '6px',
              px: 0.75,
              py: 0.5,
              border: shade === 'light' || shade === 'lighter'
                ? `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}`
                : '1px solid transparent',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: ct,
                opacity: 0.75,
              }}
            >
              {shade}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <Typography
                sx={{
                  color: ct,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                Aa テキスト
              </Typography>
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
                }}
              >
                Button
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: '0.6rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: ct,
                opacity: 0.85,
                whiteSpace: 'nowrap',
              }}
              title={`${ratio.toFixed(2)}:1 — ${level}`}
            >
              {ratio.toFixed(1)} {level}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
});
ContrastPreview.displayName = 'ContrastPreview';

// ── Scheme Column (light / dark) ──

const SchemeColumn = memo<{
  variant: MuiColorVariant;
  mode: 'light' | 'dark';
  onCopy: (text: string) => void;
}>(({ variant, mode, onCopy }) => {
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
          contrastText={variant.contrastText}
          isDark={isDark}
          onCopy={onCopy}
        />
      ))}

      {/* contrastText を実運用シーンで確認するためのサンプル（ボタン / テキスト） */}
      <ContrastPreview variant={variant} isDark={isDark} />
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
  ({ colorPalette, colorName, onEdit }) => {
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
            onCopy={handleCopy}
          />
          <SchemeColumn
            variant={colorPalette.dark}
            mode='dark'
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

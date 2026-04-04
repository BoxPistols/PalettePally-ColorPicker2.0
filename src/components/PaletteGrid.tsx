import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Box, Typography, Snackbar } from '@mui/material';
import chroma from 'chroma-js';
import { ColorPalette, MuiColorVariant } from './colorUtils';

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

const ColorSwatch = memo<{
  shade: keyof MuiColorVariant;
  colorValue: string;
  isDark: boolean;
  editMode: boolean;
  onCopy: (text: string) => void;
  onEdit?: (shade: keyof MuiColorVariant, value: string) => void;
}>(({ shade, colorValue, isDark, editMode, onCopy, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(colorValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLight = shade === 'light';
  const luminance = chroma(colorValue).luminance();
  const textColor =
    luminance > 0.35 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
  const isEditing = editMode || editing;

  useEffect(() => {
    setEditValue(colorValue);
  }, [colorValue]);

  useEffect(() => {
    if (editing && !editMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing, editMode]);

  const commitEdit = () => {
    setEditing(false);
    const val = editValue.startsWith('#') ? editValue : `#${editValue}`;
    if (isValidHex(val) && onEdit) {
      onEdit(shade, val);
    } else {
      setEditValue(colorValue);
    }
  };

  return (
    <Box
      onClick={() => {
        if (!isEditing) onCopy(colorValue);
      }}
      onDoubleClick={e => {
        e.stopPropagation();
        if (!editMode && onEdit) setEditing(true);
      }}
      title={isEditing ? '' : `${shade}: ${colorValue} — click to copy, double-click to edit`}
      sx={{
        background: colorValue,
        borderRadius: '6px',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        color: textColor,
        mb: 0.5,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        cursor: isEditing ? 'default' : 'pointer',
        border: editMode
          ? `1.5px dashed ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}`
          : isLight
            ? `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`
            : '1.5px solid transparent',
        boxShadow:
          shade === 'main'
            ? '0 2px 6px rgba(0,0,0,0.12)'
            : '0 1px 2px rgba(0,0,0,0.06)',
        '&:hover': isEditing
          ? {}
          : {
              transform: 'scale(1.02)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            },
        '&:active': isEditing ? {} : { transform: 'scale(0.98)' },
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
        {isEditing ? (
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {editMode && (
              <Box
                component='input'
                type='color'
                value={colorValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (onEdit) onEdit(shade, e.target.value);
                }}
                sx={{
                  width: 22,
                  height: 22,
                  p: 0,
                  border: '2px solid rgba(255,255,255,0.7)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  '&::-webkit-color-swatch-wrapper': { p: 0 },
                  '&::-webkit-color-swatch': { border: 'none', borderRadius: '2px' },
                }}
              />
            )}
            <Box
              component='input'
              ref={inputRef}
              value={editValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditValue(e.target.value)
              }
              onBlur={commitEdit}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') {
                  setEditValue(colorValue);
                  setEditing(false);
                }
              }}
              sx={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '3px',
                color: '#1a1a2e',
                fontSize: '0.75rem',
                fontFamily: 'inherit',
                px: 0.5,
                py: 0.25,
                width: '5.5em',
                minWidth: 0,
                outline: 'none',
                '&:focus': {
                  borderColor: '#3f50b5',
                  boxShadow: '0 0 0 2px rgba(63,80,181,0.2)',
                },
              }}
            />
          </Box>
        ) : (
          <Box
            component='span'
            sx={{
              opacity: 0.75,
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
        )}
      </Box>
    </Box>
  );
});

ColorSwatch.displayName = 'ColorSwatch';

const SchemeColumn = memo<{
  variant: MuiColorVariant;
  mode: 'light' | 'dark';
  editMode: boolean;
  onCopy: (text: string) => void;
  onEdit?: (shade: keyof MuiColorVariant, value: string) => void;
}>(({ variant, mode, editMode, onCopy, onEdit }) => {
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
          isDark={isDark}
          editMode={editMode}
          onCopy={onCopy}
          onEdit={onEdit}
        />
      ))}
    </Box>
  );
});

SchemeColumn.displayName = 'SchemeColumn';

export const PaletteCard = memo<PaletteCardProps>(
  ({ colorPalette, colorName, onEdit }) => {
    const [editMode, setEditMode] = useState(false);
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

    const handleEditLight = useCallback(
      (shade: keyof MuiColorVariant, value: string) => {
        onEdit?.('light', shade, value);
      },
      [onEdit]
    );

    const handleEditDark = useCallback(
      (shade: keyof MuiColorVariant, value: string) => {
        onEdit?.('dark', shade, value);
      },
      [onEdit]
    );

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
                  setEditMode(prev => !prev);
                }}
                title={editMode ? 'Done editing' : 'Edit colors'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  p: 0,
                  border: '1.5px solid',
                  borderColor: editMode
                    ? 'rgba(255,255,255,0.5)'
                    : 'rgba(255,255,255,0.25)',
                  borderRadius: '6px',
                  bgcolor: editMode
                    ? 'rgba(255,255,255,0.2)'
                    : 'transparent',
                  color: headerTextColor,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                }}
              >
                {editMode ? (
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                ) : (
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
                    <path d='m15 5 4 4' />
                  </svg>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Light / Dark */}
        <Box sx={{ display: 'flex', gap: 0.75, p: 1, bgcolor: '#fff' }}>
          <SchemeColumn
            variant={colorPalette.light}
            mode='light'
            editMode={editMode}
            onCopy={handleCopy}
            onEdit={onEdit ? handleEditLight : undefined}
          />
          <SchemeColumn
            variant={colorPalette.dark}
            mode='dark'
            editMode={editMode}
            onCopy={handleCopy}
            onEdit={onEdit ? handleEditDark : undefined}
          />
        </Box>

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

import { Box, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState, memo, useMemo } from 'react';

import { SketchPicker } from 'react-color';
import chroma from 'chroma-js';

type ColorInputFieldProps = {
  color: string;
  onChange: (newColor: string) => void;
};

// chroma が壊れた hex を投げないようガードしつつ、HEX / RGB / HSL を 1 行ずつ表示
function formatColorReadouts(hex: string): { rgb: string; hsl: string } | null {
  try {
    const c = chroma(hex);
    const [r, g, b] = c.rgb();
    const [h, s, l] = c.hsl();
    const hh = Number.isNaN(h) ? 0 : Math.round(h);
    const ss = Math.round((Number.isNaN(s) ? 0 : s) * 100);
    const ll = Math.round((Number.isNaN(l) ? 0 : l) * 100);
    return {
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hh}, ${ss}%, ${ll}%)`,
    };
  } catch {
    return null;
  }
}

const ColorInputField = memo(({ color, onChange }: ColorInputFieldProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState<'hex' | 'rgb' | 'hsl' | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const readouts = useMemo(() => formatColorReadouts(color), [color]);

  const handleCopy = async (kind: 'hex' | 'rgb' | 'hsl', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(prev => (prev === kind ? null : prev)), 1200);
    } catch {
      /* clipboard 利用不可環境ではサイレントに失敗 */
    }
  };

  return (
    <Box
      sx={{
        '> .sketch-picker': {
          width: '100% !important',
          minWidth: '0 !important',
          maxWidth: '100% !important',
          boxSizing: 'border-box',
          boxShadow: 'none !important',
          backgroundColor: 'transparent !important',
          padding: '0 !important',
          // Saturation area (aspect ratio wrapper) を高さ制限
          '> div:first-of-type': {
            paddingBottom: '0 !important',
            height: '120px !important',
          },
          ' .saturation-white': {
            borderRadius: '6px',
          },
          ' input': {
            width: '100% !important',
            padding: '0.15rem !important',
            fontSize: '11px !important',
            borderRadius: '3px !important',
            textAlign: 'center !important',
            '&:focus': {
              boxShadow: 'none !important',
            },
          },
        },
      }}
    >
      {isMounted && (
        <SketchPicker
          color={color}
          onChange={(updatedColor: { hex: string }) =>
            onChange(updatedColor.hex)
          }
          width='100%'
        />
      )}

      {readouts && (
        <Box sx={{ mt: 0.75, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {(
            [
              { kind: 'hex' as const, label: 'HEX', value: color.toUpperCase() },
              { kind: 'rgb' as const, label: 'RGB', value: readouts.rgb },
              { kind: 'hsl' as const, label: 'HSL', value: readouts.hsl },
            ]
          ).map(row => (
            <Tooltip key={row.kind} arrow placement='right' title='クリックでコピー'>
              <Box
                onClick={() => handleCopy(row.kind, row.value)}
                role='button'
                aria-label={`${row.label} をコピー`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  bgcolor: copied === row.kind ? 'rgba(46,125,50,0.12)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    color: 'rgba(0,0,0,0.5)',
                    minWidth: 28,
                  }}
                >
                  {row.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    color: '#1a1a2e',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.value}
                </Typography>
                {copied === row.kind && (
                  <Typography sx={{ fontSize: '0.6rem', color: '#2e7d32', fontWeight: 700 }}>
                    ✓ Copied
                  </Typography>
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  );
});

ColorInputField.displayName = 'ColorInputField';

export default ColorInputField;

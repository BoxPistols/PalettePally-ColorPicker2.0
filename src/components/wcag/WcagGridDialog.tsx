import React, { memo, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { PaletteData } from '@/lib/types/palette';
import { contrastRatio, wcagLevel, WCAG_COLOR } from '@/lib/wcag';

type WcagGridDialogProps = {
  open: boolean;
  onClose: () => void;
  paletteData: PaletteData;
};

// パレットから「メイン色のみ」を取り出した {name, color} のリスト
function extractMainColors(
  data: PaletteData,
  mode: 'light' | 'dark'
): { name: string; color: string }[] {
  return (data.palette ?? [])
    .map(entry => {
      const [name, palette] = Object.entries(entry)[0] ?? [];
      return name && palette ? { name, color: palette[mode].main } : null;
    })
    .filter((v): v is { name: string; color: string } => v !== null);
}

export const WcagGridDialog = memo<WcagGridDialogProps>(
  ({ open, onClose, paletteData }) => {
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    const colors = useMemo(() => extractMainColors(paletteData, mode), [paletteData, mode]);

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='lg'
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', maxHeight: '90vh' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            px: 3,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
              WCAG Contrast Grid
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
              全カラー組み合わせのコントラスト比 (foreground × background)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, v) => v && setMode(v)}
              size='small'
            >
              <ToggleButton value='light' sx={{ textTransform: 'none', px: 2 }}>Light</ToggleButton>
              <ToggleButton value='dark' sx={{ textTransform: 'none', px: 2 }}>Dark</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={onClose} size='small'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <line x1='18' y1='6' x2='6' y2='18' />
                <line x1='6' y1='6' x2='18' y2='18' />
              </svg>
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, overflow: 'auto' }}>
          {colors.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              パレットが空です
            </Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, fontSize: '0.7rem' }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Legend:</Typography>
                {(['AAA', 'AA', 'AA-Large', 'Fail'] as const).map(l => (
                  <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: WCAG_COLOR[l] }} />
                    <Typography sx={{ fontSize: '0.7rem' }}>{l}</Typography>
                  </Box>
                ))}
              </Box>
              <Grid colors={colors} />
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);
WcagGridDialog.displayName = 'WcagGridDialog';

const Grid = memo<{ colors: { name: string; color: string }[] }>(({ colors }) => {
  const cellSize = 56;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `100px repeat(${colors.length}, ${cellSize}px)`,
          gap: '2px',
        }}
      >
        {/* Header row: background colors */}
        <Box />
        {colors.map(c => (
          <Box
            key={`head-${c.name}`}
            sx={{
              bgcolor: c.color,
              height: cellSize,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.5,
            }}
            title={`${c.name} · ${c.color}`}
          >
            <Typography
              sx={{
                fontSize: '0.6rem',
                fontWeight: 600,
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                textAlign: 'center',
                wordBreak: 'break-all',
              }}
            >
              {c.name}
            </Typography>
          </Box>
        ))}

        {/* Body rows: foreground colors × background colors */}
        {colors.map(fg => (
          <React.Fragment key={`row-${fg.name}`}>
            <Box
              sx={{
                bgcolor: fg.color,
                height: cellSize,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0.5,
              }}
              title={`${fg.name} · ${fg.color}`}
            >
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  textAlign: 'center',
                }}
              >
                {fg.name}
              </Typography>
            </Box>
            {colors.map(bg => {
              const ratio = contrastRatio(fg.color, bg.color);
              const level = wcagLevel(ratio);
              return (
                <Box
                  key={`${fg.name}-${bg.name}`}
                  title={`${fg.name} on ${bg.name}: ${ratio.toFixed(2)}:1 (${level})`}
                  sx={{
                    bgcolor: bg.color,
                    height: cellSize,
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    border: `2px solid ${WCAG_COLOR[level]}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: fg.color,
                      fontFamily: 'monospace',
                    }}
                  >
                    Aa
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      color: fg.color,
                      lineHeight: 1,
                    }}
                  >
                    {ratio.toFixed(1)}
                  </Typography>
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
});
Grid.displayName = 'Grid';

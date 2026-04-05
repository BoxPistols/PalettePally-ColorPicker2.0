import React, { memo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  Alert,
} from '@mui/material';
import { PaletteData } from '@/lib/types/palette';

type CompareDialogProps = {
  open: boolean;
  onClose: () => void;
  current: PaletteData;
};

// Hex の EU 距離 (ざっくり色差を可視化)
function colorDistance(a: string, b: string): number {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  try {
    const [r1, g1, b1] = parse(a);
    const [r2, g2, b2] = parse(b);
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  } catch {
    return 0;
  }
}

export const CompareDialog = memo<CompareDialogProps>(({ open, onClose, current }) => {
  const [pastedJson, setPastedJson] = useState('');
  const [other, setOther] = useState<PaletteData | null>(null);
  const [error, setError] = useState('');

  const handleParse = (value: string) => {
    setPastedJson(value);
    if (!value.trim()) {
      setOther(null);
      setError('');
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed.colors) && Array.isArray(parsed.palette)) {
        setOther(parsed as PaletteData);
        setError('');
      } else {
        setError('Not a valid Palette Pally JSON');
        setOther(null);
      }
    } catch {
      setError('Invalid JSON');
      setOther(null);
    }
  };

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
        <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
          Compare Palettes
        </Typography>
        <IconButton onClick={onClose} size='small'>
          <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <line x1='18' y1='6' x2='6' y2='18' />
            <line x1='6' y1='6' x2='18' y2='18' />
          </svg>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2 }}>
          比較したい Palette Pally JSON をペーストすると、現在のパレットと並べて差分を表示します。
        </Typography>

        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder='Paste Palette Pally JSON (Export Hub → JSON)'
          value={pastedJson}
          onChange={e => handleParse(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            '& textarea': { fontFamily: 'monospace', fontSize: '0.75rem' },
          }}
        />

        {error && (
          <Alert severity='error' sx={{ mb: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        {other && (
          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(0,0,0,0.5)' }}>
                Current ({current.colors?.length ?? 0} colors)
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(0,0,0,0.5)' }}>
                Imported ({other.colors?.length ?? 0} colors)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({
                length: Math.max(current.colors?.length ?? 0, other.colors?.length ?? 0),
              }).map((_, idx) => {
                const cName = current.names?.[idx];
                const cColor = current.colors?.[idx];
                const oName = other.names?.[idx];
                const oColor = other.colors?.[idx];
                const dist = cColor && oColor ? colorDistance(cColor, oColor) : null;
                const changed = dist !== null && dist > 5;
                return (
                  <Box
                    key={idx}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 60px 1fr',
                      gap: 2,
                      alignItems: 'center',
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: changed ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                    }}
                  >
                    {cColor ? (
                      <ColorRow name={cName ?? `color${idx + 1}`} color={cColor} />
                    ) : (
                      <Box sx={{ color: 'rgba(0,0,0,0.3)', fontSize: '0.75rem', fontStyle: 'italic' }}>(missing)</Box>
                    )}
                    <Box sx={{ textAlign: 'center' }}>
                      {dist !== null ? (
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: changed ? '#f59e0b' : 'rgba(0,0,0,0.3)',
                          }}
                        >
                          {changed ? 'Δ' : '='}
                          {dist > 0 && ` ${Math.round(dist)}`}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.3)' }}>—</Typography>
                      )}
                    </Box>
                    {oColor ? (
                      <ColorRow name={oName ?? `color${idx + 1}`} color={oColor} />
                    ) : (
                      <Box sx={{ color: 'rgba(0,0,0,0.3)', fontSize: '0.75rem', fontStyle: 'italic' }}>(missing)</Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
});
CompareDialog.displayName = 'CompareDialog';

const ColorRow = memo<{ name: string; color: string }>(({ name, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '6px',
        bgcolor: color,
        border: '1px solid rgba(0,0,0,0.1)',
        flexShrink: 0,
      }}
    />
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
        {name}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontFamily: 'monospace' }}>
        {color}
      </Typography>
    </Box>
  </Box>
));
ColorRow.displayName = 'ColorRow';

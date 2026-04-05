import React, { memo, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { HarmonyScheme, HARMONY_LABELS, generateHarmony } from '@/lib/harmony';

type HarmonyDialogProps = {
  open: boolean;
  onClose: () => void;
  baseColor: string;
  count: number;
  onApply: (colors: string[]) => void;
};

const SCHEMES: HarmonyScheme[] = [
  'complementary',
  'analogous',
  'triadic',
  'tetradic',
  'splitComplement',
  'monochrome',
];

export const HarmonyDialog = memo<HarmonyDialogProps>(
  ({ open, onClose, baseColor, count, onApply }) => {
    const [scheme, setScheme] = useState<HarmonyScheme>('triadic');
    const [base, setBase] = useState(baseColor);

    const preview = useMemo(() => {
      try {
        return generateHarmony(base, scheme, count);
      } catch {
        return [];
      }
    }, [base, scheme, count]);

    const handleApply = () => {
      if (preview.length > 0) {
        onApply(preview);
        onClose();
      }
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
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
            Generate Harmony
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
            ベースカラーから配色理論に基づいて {count} 色のパレットを生成します。
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              component='input'
              type='color'
              value={base}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBase(e.target.value)}
              sx={{
                width: 44, height: 44, p: 0,
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '8px', cursor: 'pointer', flexShrink: 0,
              }}
            />
            <TextField
              value={base}
              onChange={e => setBase(e.target.value)}
              size='small'
              sx={{ width: 140, '& input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Base color
            </Typography>
          </Box>

          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1.5 }}>
            Harmony Scheme
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3 }}>
            {SCHEMES.map(s => (
              <Button
                key={s}
                variant={scheme === s ? 'contained' : 'outlined'}
                onClick={() => setScheme(s)}
                size='small'
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  py: 0.75,
                }}
              >
                {HARMONY_LABELS[s]}
              </Button>
            ))}
          </Box>

          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
            Preview
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 2, height: 60 }}>
            {preview.map((c, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  bgcolor: c,
                  borderRadius: '6px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  position: 'relative',
                }}
                title={c}
              >
                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    fontSize: '0.6rem',
                    fontFamily: 'monospace',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {c}
                </Typography>
              </Box>
            ))}
          </Box>

          <Alert severity='warning' sx={{ borderRadius: '8px', fontSize: '0.8rem' }}>
            現在のパレットが上書きされます。
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            variant='contained'
            disabled={preview.length === 0}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

HarmonyDialog.displayName = 'HarmonyDialog';

import React, { memo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import { PaletteData } from '@/lib/types/palette';
import { paletteToDTCG } from '@/lib/figma/dtcg';

type FigmaExportDialogProps = {
  open: boolean;
  onClose: () => void;
  paletteData: PaletteData;
  fileKey: string;
  pat: string;
  onConfirm: () => Promise<boolean>;
};

export const FigmaExportDialog = memo<FigmaExportDialogProps>(
  ({ open, onClose, paletteData, fileKey, pat, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const dtcg = paletteToDTCG(paletteData);
    const collections = Object.keys(dtcg);
    const totalTokens = Object.values(dtcg).reduce((sum, group) => {
      const count = (g: Record<string, unknown>): number =>
        Object.values(g).reduce((s: number, v) => {
          if (v && typeof v === 'object' && '$value' in (v as Record<string, unknown>)) return s + 1;
          if (v && typeof v === 'object') return s + count(v as Record<string, unknown>);
          return s;
        }, 0);
      return sum + count(group as Record<string, unknown>);
    }, 0);

    const handlePush = async () => {
      const confirmed = await onConfirm();
      if (!confirmed) return;

      setError('');
      setLoading(true);
      try {
        const res = await fetch('/api/figma/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Figma-Token': pat,
          },
          body: JSON.stringify({ fileKey, paletteData }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed (${res.status})`);
        }
        setSuccess(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Push failed');
      } finally {
        setLoading(false);
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
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
          Export to Figma Variables
        </DialogTitle>
        {loading && <LinearProgress />}
        <DialogContent sx={{ pt: '16px !important' }}>
          {error && (
            <Alert severity='error' sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}
          {success ? (
            <Alert severity='success' sx={{ borderRadius: '8px' }}>
              Variables pushed to Figma successfully!
            </Alert>
          ) : (
            <>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2 }}>
                The following will be created/updated as Figma Variables:
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {collections.map(c => (
                  <Chip key={c} label={c} size='small' variant='outlined' />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Collections
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {collections.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Tokens
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {totalTokens}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Modes
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    2 (light/dark)
                  </Typography>
                </Box>
              </Box>

              <Alert severity='warning' sx={{ borderRadius: '8px', fontSize: '0.8rem' }}>
                Existing variables with the same names will be overwritten.
                Figma Enterprise/Organization plan required for Variables API.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            {success ? 'Done' : 'Cancel'}
          </Button>
          {!success && (
            <Button
              onClick={handlePush}
              variant='contained'
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
            >
              {loading ? 'Pushing...' : 'Push to Figma'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
);

FigmaExportDialog.displayName = 'FigmaExportDialog';

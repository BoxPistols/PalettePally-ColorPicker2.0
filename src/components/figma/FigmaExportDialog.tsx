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
import { getAuthHeader } from '@/lib/firebase/auth';
import { t } from '@/lib/i18n';

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
        const authHeader = await getAuthHeader();
        const res = await fetch('/api/figma/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Figma-Token': pat,
            ...authHeader,
          },
          body: JSON.stringify({ fileKey, paletteData }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || t.figmaExportDialog.failedWithStatus(res.status));
        }
        setSuccess(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t.figmaExportDialog.pushFailed);
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
          {t.figmaExportDialog.title}
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
              {t.figmaExportDialog.successMessage}
            </Alert>
          ) : (
            <>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2 }}>
                {t.figmaExportDialog.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {collections.map(c => (
                  <Chip key={c} label={c} size='small' variant='outlined' />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {t.figmaExportDialog.collectionsLabel}
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {collections.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {t.figmaExportDialog.tokensLabel}
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {totalTokens}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {t.figmaExportDialog.modesLabel}
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {t.figmaExportDialog.modesValue}
                  </Typography>
                </Box>
              </Box>

              <Alert severity='warning' sx={{ borderRadius: '8px', fontSize: '0.8rem', mb: 1.5 }}>
                {t.figmaExportDialog.overwriteWarning}
              </Alert>
              <Alert severity='info' sx={{ borderRadius: '8px', fontSize: '0.78rem' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, mb: 0.5 }}>
                  {t.figmaExportDialog.enterpriseOnlyTitle}
                </Typography>
                {t.figmaExportDialog.enterpriseFallbackIntro}
                <Box component='ul' sx={{ m: 0, pl: 2.5, mt: 0.5 }}>
                  <li>
                    <strong>{t.figmaExportDialog.pluginName}</strong>
                    {t.figmaExportDialog.pluginDesc}
                  </li>
                  <li>
                    <strong>{t.figmaExportDialog.tokensStudioName}</strong>{' '}
                    {t.figmaExportDialog.tokensStudioDesc}
                  </li>
                </Box>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            {success ? t.figmaExportDialog.doneButton : t.figmaExportDialog.cancelButton}
          </Button>
          {!success && (
            <Button
              onClick={handlePush}
              variant='contained'
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
            >
              {loading ? t.figmaExportDialog.pushingButton : t.figmaExportDialog.pushButton}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
);

FigmaExportDialog.displayName = 'FigmaExportDialog';

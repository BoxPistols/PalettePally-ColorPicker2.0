import React, { memo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Snackbar,
} from '@mui/material';
import * as firestoreService from '@/lib/firebase/firestore';

type ShareDialogProps = {
  open: boolean;
  onClose: () => void;
  paletteId: string;
  paletteName: string;
  currentShareId: string | null;
  onRevoke: () => Promise<boolean>;
};

export const ShareDialog = memo<ShareDialogProps>(
  ({ open, onClose, paletteId, paletteName, currentShareId, onRevoke }) => {
    const [permission, setPermission] = useState<'view' | 'duplicate'>('view');
    const [shareId, setShareId] = useState(currentShareId);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const shareUrl = shareId
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${shareId}`
      : '';

    const handleGenerate = async () => {
      setError('');
      setLoading(true);
      try {
        const id = await firestoreService.generateShareLink(paletteId, permission);
        setShareId(id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to generate link');
      } finally {
        setLoading(false);
      }
    };

    const handleRevoke = async () => {
      const confirmed = await onRevoke();
      if (confirmed) {
        try {
          await firestoreService.revokeShareLink(paletteId);
          setShareId(null);
        } catch {
          setError('Failed to revoke link');
        }
      }
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
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
          Share: {paletteName}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {error && (
            <Alert severity='error' sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          {shareId ? (
            <Box>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 1 }}>
                Share link:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  value={shareUrl}
                  fullWidth
                  size='small'
                  InputProps={{ readOnly: true }}
                  sx={{ '& input': { fontSize: '0.8rem', fontFamily: 'monospace' } }}
                />
                <Button
                  onClick={handleCopy}
                  variant='outlined'
                  size='small'
                  sx={{ textTransform: 'none', flexShrink: 0 }}
                >
                  Copy
                </Button>
              </Box>
              <Button
                onClick={handleRevoke}
                color='error'
                size='small'
                sx={{ textTransform: 'none', mt: 2 }}
              >
                Revoke Link
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography sx={{ fontSize: '0.85rem', mb: 1.5 }}>
                Permission:
              </Typography>
              <ToggleButtonGroup
                value={permission}
                exclusive
                onChange={(_, v) => v && setPermission(v)}
                size='small'
                sx={{ mb: 2 }}
              >
                <ToggleButton value='view' sx={{ textTransform: 'none', px: 2 }}>
                  View only
                </ToggleButton>
                <ToggleButton value='duplicate' sx={{ textTransform: 'none', px: 2 }}>
                  View + Duplicate
                </ToggleButton>
              </ToggleButtonGroup>
              <Box>
                <Button
                  onClick={handleGenerate}
                  variant='contained'
                  disabled={loading}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                >
                  {loading ? '...' : 'Generate Share Link'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
        <Snackbar
          open={copied}
          autoHideDuration={2000}
          onClose={() => setCopied(false)}
          message='Link copied!'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Dialog>
    );
  }
);

ShareDialog.displayName = 'ShareDialog';

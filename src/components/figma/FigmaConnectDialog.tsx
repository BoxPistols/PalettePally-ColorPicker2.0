import React, { memo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Link,
} from '@mui/material';
import { extractFileKey } from '@/lib/figma/types';

type FigmaConnectDialogProps = {
  open: boolean;
  onClose: () => void;
  onConnect: (pat: string, fileKey: string) => void;
  savedPat?: string;
  savedFileKey?: string;
};

export const FigmaConnectDialog = memo<FigmaConnectDialogProps>(
  ({ open, onClose, onConnect, savedPat = '', savedFileKey = '' }) => {
    const [pat, setPat] = useState(savedPat);
    const [fileUrl, setFileUrl] = useState(savedFileKey);
    const [error, setError] = useState('');

    const handleConnect = () => {
      if (!pat.trim()) {
        setError('Personal Access Token is required');
        return;
      }
      const fileKey = extractFileKey(fileUrl.trim());
      if (!fileKey) {
        setError('Invalid Figma file URL or key');
        return;
      }
      setError('');
      onConnect(pat.trim(), fileKey);
      onClose();
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
          Connect to Figma
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {error && (
            <Alert severity='error' sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
              Personal Access Token
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>
              <Link
                href='https://www.figma.com/developers/api#access-tokens'
                target='_blank'
                rel='noopener'
              >
                Figma Settings
              </Link>
              {' '}from generate. Scopes: File content + Variables (read/write)
            </Typography>
            <TextField
              value={pat}
              onChange={e => setPat(e.target.value)}
              fullWidth
              size='small'
              type='password'
              placeholder='figd_...'
              sx={{ '& input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
              Figma File URL or Key
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>
              figma.com/design/XXXXXX/... or file key directly
            </Typography>
            <TextField
              value={fileUrl}
              onChange={e => setFileUrl(e.target.value)}
              fullWidth
              size='small'
              placeholder='https://www.figma.com/design/...'
              sx={{ '& input': { fontSize: '0.85rem' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            variant='contained'
            disabled={!pat.trim() || !fileUrl.trim()}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

FigmaConnectDialog.displayName = 'FigmaConnectDialog';

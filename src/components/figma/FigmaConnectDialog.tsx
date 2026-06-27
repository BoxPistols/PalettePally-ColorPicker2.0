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
import { t } from '@/lib/i18n';

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
        setError(t.figmaConnectDialog.patRequiredError);
        return;
      }
      const fileKey = extractFileKey(fileUrl.trim());
      if (!fileKey) {
        setError(t.figmaConnectDialog.invalidFileUrlError);
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
          {t.figmaConnectDialog.title}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {error && (
            <Alert severity='error' sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
              {t.figmaConnectDialog.patLabel}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>
              <Link
                href='https://www.figma.com/developers/api#access-tokens'
                target='_blank'
                rel='noopener'
              >
                {t.figmaConnectDialog.figmaSettingsLink}
              </Link>
              {' '}{t.figmaConnectDialog.patHelperSuffix}
            </Typography>
            <TextField
              value={pat}
              onChange={e => setPat(e.target.value)}
              fullWidth
              size='small'
              type='password'
              placeholder={t.figmaConnectDialog.patPlaceholder}
              sx={{ '& input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
            {/* セキュリティ注意: PAT はブラウザ→API 経由で送信され、永続保存はしないが
                クライアントに渡る。XSS 時の漏洩リスクがあるため最小スコープ + 使用後失効を推奨。
                恒久対策（OAuth 化）は docs/security.md 参照。 */}
            <Typography sx={{ fontSize: '0.7rem', color: 'warning.main', mt: 0.75 }}>
              {t.figmaConnectDialog.patSecurityWarning}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
              {t.figmaConnectDialog.fileUrlLabel}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>
              {t.figmaConnectDialog.fileUrlHelper}
            </Typography>
            <TextField
              value={fileUrl}
              onChange={e => setFileUrl(e.target.value)}
              fullWidth
              size='small'
              placeholder={t.figmaConnectDialog.fileUrlPlaceholder}
              sx={{ '& input': { fontSize: '0.85rem' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            {t.figmaConnectDialog.cancel}
          </Button>
          <Button
            onClick={handleConnect}
            variant='contained'
            disabled={!pat.trim() || !fileUrl.trim()}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            {t.figmaConnectDialog.connect}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

FigmaConnectDialog.displayName = 'FigmaConnectDialog';

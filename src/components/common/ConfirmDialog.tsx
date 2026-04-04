import React, { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { ConfirmDialogState } from '@/hooks/useConfirmDialog';

type ConfirmDialogProps = {
  state: ConfirmDialogState;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = memo<ConfirmDialogProps>(
  ({ state, onConfirm, onCancel }) => {
    const {
      open,
      title,
      message,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      severity = 'warning',
    } = state;

    const confirmColor = severity === 'error' ? 'error' : 'warning';

    return (
      <Dialog
        open={open}
        onClose={onCancel}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 0.5 }}>
          {title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
            {message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onCancel}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            variant='contained'
            color={confirmColor}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

ConfirmDialog.displayName = 'ConfirmDialog';

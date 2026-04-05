import React, { memo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';

type SavePaletteDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  defaultName?: string;
  isUpdate?: boolean;
};

export const SavePaletteDialog = memo<SavePaletteDialogProps>(
  ({ open, onClose, onSave, defaultName = '', isUpdate = false }) => {
    const [name, setName] = useState(defaultName);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
      if (!name.trim()) return;
      setError('');
      setLoading(true);
      try {
        await onSave(name.trim(), description.trim());
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
          {isUpdate ? 'Update Palette' : 'Save Palette'}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {error && (
            <Alert severity='error' sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}
          <TextField
            label='Palette Name'
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            size='small'
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            label='Description (optional)'
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            size='small'
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant='contained'
            disabled={loading || !name.trim()}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            {loading ? '...' : isUpdate ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

SavePaletteDialog.displayName = 'SavePaletteDialog';

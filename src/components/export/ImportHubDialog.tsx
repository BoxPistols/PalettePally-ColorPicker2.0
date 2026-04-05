import React, { memo, useState } from 'react';
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
  Chip,
} from '@mui/material';
import { PaletteData } from '@/lib/types/palette';
import { detectAndParse, ImportResult } from '@/lib/formatters';

type ImportHubDialogProps = {
  open: boolean;
  onClose: () => void;
  onImport: (data: Partial<PaletteData>) => void;
  onConfirm: () => Promise<boolean>;
};

export const ImportHubDialog = memo<ImportHubDialogProps>(
  ({ open, onClose, onImport, onConfirm }) => {
    const [text, setText] = useState('');
    const [result, setResult] = useState<ImportResult | null>(null);

    const handleParse = (value: string) => {
      setText(value);
      if (!value.trim()) {
        setResult(null);
        return;
      }
      setResult(detectAndParse(value));
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const content = ev.target?.result as string;
        handleParse(content);
      };
      reader.readAsText(file);
    };

    const handleImport = async () => {
      if (!result || result.format === 'unknown') return;
      const confirmed = await onConfirm();
      if (!confirmed) return;
      onImport(result.data as Partial<PaletteData>);
      setText('');
      setResult(null);
      onClose();
    };

    const formatChip = (() => {
      if (!result) return null;
      if (result.format === 'unknown') {
        return <Chip label='Unknown' size='small' color='error' />;
      }
      const label = {
        json: 'JSON (Native)',
        dtcg: 'DTCG',
        tokensStudio: 'Tokens Studio',
      }[result.format];
      return <Chip label={label} size='small' color='success' />;
    })();

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='md'
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
            Import Palette
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
            JSON / DTCG / Tokens Studio 形式を自動判定します。ファイルアップロードまたは直接ペースト。
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              component='label'
              variant='outlined'
              size='small'
              sx={{ textTransform: 'none', borderRadius: '6px' }}
            >
              Upload File
              <input
                type='file'
                accept='.json,.txt'
                onChange={handleFile}
                hidden
              />
            </Button>
            {formatChip}
          </Box>

          <TextField
            multiline
            rows={12}
            fullWidth
            placeholder='Paste JSON content here (auto-detect format)'
            value={text}
            onChange={e => handleParse(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              '& textarea': {
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: '0.78rem',
                lineHeight: 1.5,
              },
            }}
          />

          {result?.format === 'unknown' && (
            <Alert severity='error' sx={{ mt: 2, borderRadius: '8px' }}>
              {result.error}
            </Alert>
          )}

          {result && result.format !== 'unknown' && result.format === 'dtcg' && (
            <Alert severity='info' sx={{ mt: 2, borderRadius: '8px' }}>
              DTCG 形式は部分的インポートのみサポート (色数・名前のみ反映)
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant='contained'
            disabled={!result || result.format === 'unknown'}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

ImportHubDialog.displayName = 'ImportHubDialog';

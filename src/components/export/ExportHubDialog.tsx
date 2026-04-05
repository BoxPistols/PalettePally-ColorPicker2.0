import React, { memo, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Snackbar,
} from '@mui/material';
import { PaletteData } from '@/lib/types/palette';
import {
  ExportFormat,
  FORMATTERS,
  FORMAT_LABELS,
  FORMAT_EXTENSIONS,
} from '@/lib/formatters';

type ExportHubDialogProps = {
  open: boolean;
  onClose: () => void;
  paletteData: PaletteData;
};

const FORMATS: ExportFormat[] = [
  'json',
  'dtcg',
  'tokensStudio',
  'css',
  'scss',
  'mui',
  'tailwind',
  'mcpPrompt',
];

export const ExportHubDialog = memo<ExportHubDialogProps>(
  ({ open, onClose, paletteData }) => {
    const [format, setFormat] = useState<ExportFormat>('json');
    const [copied, setCopied] = useState(false);

    const content = useMemo(() => {
      try {
        return FORMATTERS[format](paletteData);
      } catch (err) {
        return `// Error: ${err instanceof Error ? err.message : 'unknown'}`;
      }
    }, [format, paletteData]);

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
    };

    const handleDownload = () => {
      const ext = FORMAT_EXTENSIONS[format];
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `palette-pally.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const lineCount = content.split('\n').length;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='md'
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
            Export Palette
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </IconButton>
        </DialogTitle>

        <Tabs
          value={format}
          onChange={(_, v) => setFormat(v)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              minHeight: 44,
            },
          }}
        >
          {FORMATS.map(f => (
            <Tab key={f} label={FORMAT_LABELS[f]} value={f} />
          ))}
        </Tabs>

        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 1.5,
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              bgcolor: '#fafafa',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {lineCount} lines · .{FORMAT_EXTENSIONS[format]}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size='small'
                onClick={handleCopy}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Copy
              </Button>
              <Button
                size='small'
                variant='contained'
                onClick={handleDownload}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
              >
                Download
              </Button>
            </Box>
          </Box>

          <Box
            component='pre'
            sx={{
              m: 0,
              p: 3,
              maxHeight: '60vh',
              overflow: 'auto',
              bgcolor: '#1e1e2e',
              color: '#e4e4e7',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: '0.78rem',
              lineHeight: 1.55,
              whiteSpace: 'pre',
            }}
          >
            {content}
          </Box>
        </DialogContent>

        <Snackbar
          open={copied}
          autoHideDuration={1500}
          onClose={() => setCopied(false)}
          message='Copied to clipboard'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Dialog>
    );
  }
);

ExportHubDialog.displayName = 'ExportHubDialog';

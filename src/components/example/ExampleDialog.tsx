import React, { memo, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CssBaseline,
} from '@mui/material';
import { PaletteData } from '@/lib/types/palette';
import { buildMuiTheme } from '@/lib/theme/buildMuiTheme';
import { ExampleShowcase } from './ExampleShowcase';

type ExampleDialogProps = {
  open: boolean;
  onClose: () => void;
  paletteData: PaletteData;
};

export const ExampleDialog = memo<ExampleDialogProps>(
  ({ open, onClose, paletteData }) => {
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    const theme = useMemo(() => buildMuiTheme(paletteData, mode), [paletteData, mode]);

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '92vh',
            height: '92vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
            px: 3,
            borderBottom: 1,
            borderColor: 'divider',
            // ExampleDialog の DialogTitle は外側の `_app.tsx` theme（light
            // または dark）を反映させるため `background.paper` 参照に。中身
            // (DialogContent 内) は入れ子 ThemeProvider で buildMuiTheme が
            // 支配するが、title は外側 chrome なので ここでは palette ref のまま
            bgcolor: 'background.paper',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
              Theme Preview
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
              {paletteData.names?.[0] ?? 'primary'} — {paletteData.colors[0] ?? '-'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, v) => v && setMode(v)}
              size='small'
            >
              <ToggleButton value='light' sx={{ textTransform: 'none', px: 2 }}>
                Light
              </ToggleButton>
              <ToggleButton value='dark' sx={{ textTransform: 'none', px: 2 }}>
                Dark
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={onClose} size='small'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <line x1='18' y1='6' x2='6' y2='18' />
                <line x1='6' y1='6' x2='18' y2='18' />
              </svg>
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
              sx={{
                height: '100%',
                overflow: 'auto',
                bgcolor: 'background.default',
                p: 3,
                transition: 'background-color 0.2s',
              }}
            >
              <ExampleShowcase />
            </Box>
          </ThemeProvider>
        </DialogContent>
      </Dialog>
    );
  }
);

ExampleDialog.displayName = 'ExampleDialog';

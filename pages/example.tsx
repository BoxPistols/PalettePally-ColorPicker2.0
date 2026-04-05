import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  Box, CssBaseline, Container, Typography, ToggleButton, ToggleButtonGroup,
  Button, CircularProgress,
} from '@mui/material';
import { PaletteData } from '@/lib/types/palette';
import { buildMuiTheme, loadPaletteFromStorage } from '@/lib/theme/buildMuiTheme';
import { ExampleShowcase } from '@/components/example/ExampleShowcase';

export default function ExamplePage() {
  const [data, setData] = useState<PaletteData | null>(null);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadPaletteFromStorage());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.colors.length === 0) {
    return (
      <Container maxWidth='sm' sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          No palette data
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          Create a palette first in the generator.
        </Typography>
        <Button href='/' variant='contained'>
          Go to Generator
        </Button>
      </Container>
    );
  }

  const theme = buildMuiTheme(data, mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', transition: 'background-color 0.2s' }}>
        {/* Sticky control bar */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
              Theme Preview
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {data.names?.[0] ?? 'primary'} — {data.colors[0]}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, v) => v && setMode(v)}
              size='small'
            >
              <ToggleButton value='light' sx={{ textTransform: 'none', px: 2 }}>Light</ToggleButton>
              <ToggleButton value='dark' sx={{ textTransform: 'none', px: 2 }}>Dark</ToggleButton>
            </ToggleButtonGroup>
            <Button href='/' variant='outlined' size='small' sx={{ textTransform: 'none' }}>
              Generator
            </Button>
            <Button href='/help' size='small' sx={{ textTransform: 'none' }}>
              Help
            </Button>
          </Box>
        </Box>

        <Container maxWidth='lg' sx={{ py: 4 }}>
          <ExampleShowcase />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

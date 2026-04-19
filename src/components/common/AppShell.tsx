import React, { useMemo } from 'react';
import { ThemeProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '@/lib/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

// _app.tsx の ThemeProvider を動的にするためのラッパー。
// useColorScheme は hook なので function component 内でしか呼べないため、
// _app.tsx 本体から切り出している。
export function AppShell({ children }: { children: React.ReactNode }) {
  const { resolved } = useColorScheme();
  const theme = useMemo(() => createAppTheme(resolved), [resolved]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

import React, { memo } from 'react';
import { Box, Tooltip } from '@mui/material';
import { useColorScheme, ColorScheme } from '@/hooks/useColorScheme';
import { useAppColors } from '@/hooks/useAppColors';

// 太陽 / 月 / モニター（system）の 3-state トグル。ヘッダーに配置して
// Generator 全体の外観モードを切り替える。user palette の light/dark
// カードとは独立軸。
export const ColorSchemeToggle = memo(() => {
  const { scheme, setScheme } = useColorScheme();
  const c = useAppColors();

  const options: { value: ColorScheme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <circle cx='12' cy='12' r='4' />
          <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
        </svg>
      ),
    },
    {
      value: 'system',
      label: 'System (OS)',
      icon: (
        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <rect x='3' y='4' width='18' height='12' rx='1.5' />
          <path d='M8 20h8M12 16v4' />
        </svg>
      ),
    },
  ];

  return (
    <Tooltip arrow title={`App theme: ${scheme}（Light / Dark / System OS 追従）`}>
      <Box
        sx={{
          display: 'flex',
          bgcolor: c.chromeBg,
          borderRadius: '8px',
          border: `1px solid ${c.border}`,
          p: '2px',
        }}
      >
        {options.map(opt => {
          const active = scheme === opt.value;
          return (
            <Box
              key={opt.value}
              component='button'
              type='button'
              onClick={() => setScheme(opt.value)}
              aria-label={`Set app theme to ${opt.label}`}
              aria-pressed={active}
              sx={{
                border: 0,
                px: 1,
                py: 0.5,
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                bgcolor: active ? c.chromeBgActive : 'transparent',
                color: active ? c.textPrimary : c.textMuted,
                boxShadow: active ? `0 1px 2px ${c.shadow}` : 'none',
                letterSpacing: '0.03em',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: active ? c.chromeBgActive : c.chromeBgHover },
              }}
            >
              {opt.icon}
            </Box>
          );
        })}
      </Box>
    </Tooltip>
  );
});
ColorSchemeToggle.displayName = 'ColorSchemeToggle';

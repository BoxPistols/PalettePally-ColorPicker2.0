import React, { memo, useCallback, useState } from 'react';
import { Box, Typography, Snackbar } from '@mui/material';
import chroma from 'chroma-js';
import { GreyShades, UtilityTokens, ThemeTokens, GREY_KEYS } from './colorUtils';

const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

// ── Swatch (read-only, click to copy) ──

const TokenSwatch = memo<{
  label: string;
  value: string;
  isDark: boolean;
  onCopy: (text: string) => void;
}>(({ label, value, isDark, onCopy }) => {
  const isRgba = value.startsWith('rgba');
  const bgColor = isRgba ? (isDark ? '#121212' : '#fafafa') : value;
  let luminance: number;
  try {
    luminance = isRgba ? (isDark ? 0.01 : 0.95) : chroma(value).luminance();
  } catch {
    luminance = 0.5;
  }
  const textColor =
    luminance > 0.35 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';

  return (
    <Box
      onClick={() => onCopy(value)}
      title={`${label}: ${value}`}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: bgColor,
        borderRadius: '4px',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        color: textColor,
        mb: 0.25,
        cursor: 'pointer',
        border: isRgba
          ? `1px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`
          : '1px solid transparent',
        transition: 'transform 0.1s ease',
        '&:hover': { transform: 'scale(1.02)' },
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      {isRgba && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: value,
            borderRadius: '4px',
          }}
        />
      )}
      <Box
        px={0.75}
        py={0.375}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 0,
          position: 'relative',
        }}
      >
        <Box
          component='span'
          sx={{ fontSize: '0.75rem', fontWeight: 500, flexShrink: 0 }}
        >
          {label}
        </Box>
        <Box
          component='span'
          sx={{
            fontSize: '0.75rem',
            opacity: 0.7,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {value}
        </Box>
      </Box>
    </Box>
  );
});
TokenSwatch.displayName = 'TokenSwatch';

// ── Token Column (light or dark) ──

const TokenColumn = memo<{
  mode: 'light' | 'dark';
  children: React.ReactNode;
  onCopy: (text: string) => void;
  copyData: Record<string, unknown>;
}>(({ mode, children, onCopy, copyData }) => {
  const isDark = mode === 'dark';
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        bgcolor: isDark ? '#121212' : '#fafafa',
        borderRadius: '10px',
        p: 1,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      }}
    >
      <Typography
        variant='caption'
        onClick={() => onCopy(JSON.stringify(copyData, null, 2))}
        title='Click to copy all'
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)',
          display: 'block',
          mb: 0.75,
          cursor: 'pointer',
          '&:hover': {
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
          },
        }}
      >
        {mode}
      </Typography>
      {children}
    </Box>
  );
});
TokenColumn.displayName = 'TokenColumn';

// ── Group Label ──

const GroupLabel = memo<{ label: string; isDark: boolean }>(
  ({ label, isDark }) => (
    <Typography
      sx={{
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
        mt: 0.75,
        mb: 0.25,
        px: 0.25,
      }}
    >
      {label}
    </Typography>
  )
);
GroupLabel.displayName = 'GroupLabel';

// ── Grey Scale Card ──

export const GreyScaleCard = memo<{
  grey: ThemeTokens['grey'];
}>(({ grey }) => {
  const [snackOpen, setSnackOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
    setCopiedText(text.length > 20 ? 'Copied!' : text);
    setSnackOpen(true);
  }, []);

  return (
    <Box
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <Box
        sx={{
          background: grey.light[500],
          px: 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant='subtitle2'
          sx={{
            fontWeight: 700,
            color: '#fff',
            fontSize: '0.8rem',
            letterSpacing: 0.3,
          }}
        >
          Grey
        </Typography>
        <Typography
          variant='caption'
          sx={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.75rem',
          }}
        >
          50–900
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, p: 1, bgcolor: '#fff' }}>
        <TokenColumn mode='light' onCopy={handleCopy} copyData={grey.light}>
          {GREY_KEYS.map(k => (
            <TokenSwatch
              key={k}
              label={String(k)}
              value={grey.light[k]}
              isDark={false}
              onCopy={handleCopy}
            />
          ))}
        </TokenColumn>
        <TokenColumn mode='dark' onCopy={handleCopy} copyData={grey.dark}>
          {GREY_KEYS.map(k => (
            <TokenSwatch
              key={k}
              label={String(k)}
              value={grey.dark[k]}
              isDark={true}
              onCopy={handleCopy}
            />
          ))}
        </TokenColumn>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={1200}
        onClose={() => setSnackOpen(false)}
        message={`Copied: ${copiedText}`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
});
GreyScaleCard.displayName = 'GreyScaleCard';

// ── Utility Tokens Card ──

type TokenGroup = {
  label: string;
  entries: { key: string; value: string }[];
};

const buildGroups = (tokens: UtilityTokens): TokenGroup[] => [
  {
    label: 'text',
    entries: Object.entries(tokens.text).map(([k, v]) => ({ key: k, value: v })),
  },
  {
    label: 'background',
    entries: Object.entries(tokens.background).map(([k, v]) => ({
      key: k,
      value: v,
    })),
  },
  {
    label: 'surface',
    entries: Object.entries(tokens.surface).map(([k, v]) => ({
      key: k,
      value: v,
    })),
  },
  {
    label: 'action',
    entries: Object.entries(tokens.action).map(([k, v]) => ({
      key: k,
      value: v,
    })),
  },
  {
    label: 'divider',
    entries: [{ key: 'divider', value: tokens.divider }],
  },
  {
    label: 'common',
    entries: Object.entries(tokens.common).map(([k, v]) => ({
      key: k,
      value: v,
    })),
  },
];

export const UtilityTokensCard = memo<{
  utility: ThemeTokens['utility'];
}>(({ utility }) => {
  const [snackOpen, setSnackOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
    setCopiedText(text.length > 20 ? 'Copied!' : text);
    setSnackOpen(true);
  }, []);

  const lightGroups = buildGroups(utility.light);
  const darkGroups = buildGroups(utility.dark);

  return (
    <Box
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #334155, #1e293b)',
          px: 1.5,
          py: 1,
        }}
      >
        <Typography
          variant='subtitle2'
          sx={{
            fontWeight: 700,
            color: '#fff',
            fontSize: '0.8rem',
            letterSpacing: 0.3,
          }}
        >
          Utility Tokens
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, p: 1, bgcolor: '#fff' }}>
        <TokenColumn
          mode='light'
          onCopy={handleCopy}
          copyData={utility.light}
        >
          {lightGroups.map(group => (
            <React.Fragment key={group.label}>
              <GroupLabel label={group.label} isDark={false} />
              {group.entries.map(e => (
                <TokenSwatch
                  key={e.key}
                  label={e.key}
                  value={e.value}
                  isDark={false}
                  onCopy={handleCopy}
                />
              ))}
            </React.Fragment>
          ))}
        </TokenColumn>
        <TokenColumn
          mode='dark'
          onCopy={handleCopy}
          copyData={utility.dark}
        >
          {darkGroups.map(group => (
            <React.Fragment key={group.label}>
              <GroupLabel label={group.label} isDark={true} />
              {group.entries.map(e => (
                <TokenSwatch
                  key={e.key}
                  label={e.key}
                  value={e.value}
                  isDark={true}
                  onCopy={handleCopy}
                />
              ))}
            </React.Fragment>
          ))}
        </TokenColumn>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={1200}
        onClose={() => setSnackOpen(false)}
        message={`Copied: ${copiedText}`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
});
UtilityTokensCard.displayName = 'UtilityTokensCard';

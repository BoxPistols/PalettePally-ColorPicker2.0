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
import { downloadPalettePNG } from '@/lib/imageExport';
import { tokenizeCode, hexFromToken, TokenType } from '@/lib/highlight';
import { t } from '@/lib/i18n';

type ExportHubDialogProps = {
  open: boolean;
  onClose: () => void;
  paletteData: PaletteData;
};

// シンタックスハイライト用の配色（ダーク背景前提）
const TOKEN_COLORS: Record<TokenType, string> = {
  comment: '#6b7280',
  hex: '#f5d0fe',
  string: '#a5d6a7',
  number: '#fcd34d',
  keyword: '#93c5fd',
  punct: '#9ca3af',
  text: '#e4e4e7',
};

// トークン列をハイライト付きで描画。hex はインラインのカラースウォッチを前置する。
const CodeBlock = memo<{ content: string }>(({ content }) => {
  const tokens = useMemo(() => tokenizeCode(content), [content]);
  return (
    <Box
      component='pre'
      aria-label={t.exportHubDialog.exportPreviewAriaLabel}
      sx={{
        m: 0,
        p: 3,
        maxHeight: '60vh',
        overflow: 'auto',
        bgcolor: '#1e1e2e',
        color: TOKEN_COLORS.text,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: '0.78rem',
        lineHeight: 1.55,
        whiteSpace: 'pre',
      }}
    >
      {/* トークンは数千個になりうるため、ループ内は Emotion(sx) ではなく素の
          <span style> で描画してスタイル解決のオーバーヘッドを避ける */}
      {tokens.map((tok, i) => {
        if (tok.type === 'hex') {
          const hex = hexFromToken(tok.value);
          return (
            <span key={i} style={{ color: TOKEN_COLORS.hex }}>
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: '0.72em',
                  height: '0.72em',
                  borderRadius: '2px',
                  backgroundColor: hex,
                  border: '1px solid rgba(255,255,255,0.35)',
                  marginRight: '0.32em',
                  verticalAlign: 'middle',
                }}
              />
              {tok.value}
            </span>
          );
        }
        return (
          <span key={i} style={{ color: TOKEN_COLORS[tok.type] }}>
            {tok.value}
          </span>
        );
      })}
    </Box>
  );
});
CodeBlock.displayName = 'CodeBlock';

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
            {t.exportHubDialog.title}
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
              {t.exportHubDialog.lineCountLabel(lineCount, FORMAT_EXTENSIONS[format])}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size='small'
                onClick={() => downloadPalettePNG(paletteData, { mode: 'light' })}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {t.exportHubDialog.pngLight}
              </Button>
              <Button
                size='small'
                onClick={() => downloadPalettePNG(paletteData, { mode: 'dark' })}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {t.exportHubDialog.pngDark}
              </Button>
              <Button
                size='small'
                onClick={handleCopy}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {t.exportHubDialog.copy}
              </Button>
              <Button
                size='small'
                variant='contained'
                onClick={handleDownload}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
              >
                {t.exportHubDialog.download}
              </Button>
            </Box>
          </Box>

          <CodeBlock content={content} />
        </DialogContent>

        <Snackbar
          open={copied}
          autoHideDuration={1500}
          onClose={() => setCopied(false)}
          message={t.exportHubDialog.copiedToClipboard}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Dialog>
    );
  }
);

ExportHubDialog.displayName = 'ExportHubDialog';

import React, { memo, useCallback, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
} from '@mui/material';
import chroma from 'chroma-js';
import { ThemeTokens } from './colorUtils';

const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);
const isValidColor = (v: string) =>
  /^#([0-9A-F]{3}){1,2}$/i.test(v) || v.startsWith('rgba');

// ── Shared: Token Swatch (read-only, click to copy) ──

// tintMode:
//   'bg' (既定) — トークン値を swatch 背景に塗る。grey など「値そのものを見たい」トークン向け
//   'fg'        — 背景を mode 依存の紙色に固定し、文字色にトークン値を当てる。Text グループ向け
//                 （primary/secondary/disabled の意味ラベルと実際の見え方を一致させる）
const TokenSwatch = memo<{
  label: string;
  value: string;
  isDark: boolean;
  onCopy: (text: string) => void;
  tintMode?: 'bg' | 'fg';
}>(({ label, value, isDark, onCopy, tintMode = 'bg' }) => {
  const isRgba = value.startsWith('rgba');

  const neutralBg = isDark ? '#18181b' : '#ffffff';

  // bg モード: value を塗る。輝度で白/黒の文字色を自動選択
  // fg モード: 紙色固定で value を文字色に。label も value 色で描き、意味的な
  //            primary/secondary/disabled の強弱を両カラムで同じ順に保つ
  const bgColor = tintMode === 'fg' ? neutralBg : (isRgba ? (isDark ? '#121212' : '#fafafa') : value);

  let bgLuminance: number;
  try {
    bgLuminance = isRgba && tintMode === 'bg'
      ? (isDark ? 0.01 : 0.95)
      : chroma(bgColor).luminance();
  } catch {
    bgLuminance = 0.5;
  }

  const autoTextColor = bgLuminance > 0.35 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
  const fgTextColor = isRgba ? autoTextColor : value;
  const labelColor = tintMode === 'fg' ? fgTextColor : autoTextColor;
  const valueColor = tintMode === 'fg' ? fgTextColor : autoTextColor;

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
        mb: 0.25,
        cursor: 'pointer',
        border: isRgba && tintMode === 'bg'
          ? `1px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`
          : tintMode === 'fg'
            ? `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
            : '1px solid transparent',
        transition: 'transform 0.1s ease',
        '&:hover': { transform: 'scale(1.02)' },
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      {isRgba && tintMode === 'bg' && (
        <Box sx={{ position: 'absolute', inset: 0, background: value, borderRadius: '4px' }} />
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
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            flexShrink: 0,
            color: labelColor,
          }}
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
            color: valueColor,
          }}
        >
          {value}
        </Box>
      </Box>
    </Box>
  );
});
TokenSwatch.displayName = 'TokenSwatch';

// ── Shared: Edit Cell ──

const EditCell = memo<{
  value: string;
  onChange: (value: string) => void;
}>(({ value, onChange }) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const commit = () => {
    const v = text.startsWith('#') ? text : `#${text}`;
    if (isValidColor(v)) onChange(v);
    else setText(value);
  };

  const isRgba = value.startsWith('rgba');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {!isRgba && (
        <Box
          component='input'
          type='color'
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={{
            width: 28,
            height: 28,
            p: 0,
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: '6px',
            cursor: 'pointer',
            flexShrink: 0,
            '&::-webkit-color-swatch-wrapper': { p: '2px' },
            '&::-webkit-color-swatch': { border: 'none', borderRadius: '4px' },
          }}
        />
      )}
      <Box
        component='input'
        value={text}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') commit();
        }}
        sx={{
          flex: 1,
          minWidth: 0,
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.15)',
          borderRadius: '6px',
          color: '#1a1a2e',
          fontSize: '0.8rem',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          px: 0.75,
          py: 0.5,
          outline: 'none',
          '&:focus': {
            borderColor: '#3f50b5',
            boxShadow: '0 0 0 2px rgba(63,80,181,0.15)',
          },
        }}
      />
    </Box>
  );
});
EditCell.displayName = 'EditCell';

// ── Shared: Delete Button ──

const DeleteBtn = memo<{ onClick: () => void; title?: string }>(
  ({ onClick, title = 'Remove' }) => (
    <IconButton
      onClick={onClick}
      size='small'
      title={title}
      sx={{
        width: 24,
        height: 24,
        color: 'rgba(0,0,0,0.3)',
        '&:hover': { color: '#d32f2f', bgcolor: 'rgba(211,47,47,0.08)' },
      }}
    >
      <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <line x1='18' y1='6' x2='6' y2='18' />
        <line x1='6' y1='6' x2='18' y2='18' />
      </svg>
    </IconButton>
  )
);
DeleteBtn.displayName = 'DeleteBtn';

// ── Shared: Add Row ──

const AddRow = memo<{
  placeholder: string;
  onAdd: (key: string) => void;
}>(({ placeholder, onAdd }) => {
  const [value, setValue] = useState('');
  const handleAdd = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
    }
  };
  return (
    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
      <TextField
        size='small'
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
        placeholder={placeholder}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': { borderRadius: '6px' },
          '& input': { py: 0.5, px: 1, fontSize: '0.8rem' },
        }}
      />
      <Button
        size='small'
        onClick={handleAdd}
        disabled={!value.trim()}
        sx={{ minWidth: 0, px: 1, fontSize: '0.8rem', textTransform: 'none' }}
      >
        +
      </Button>
    </Box>
  );
});
AddRow.displayName = 'AddRow';

// ── Shared: Edit Pencil Button ──

const EditButton = memo<{
  onClick: () => void;
  color?: string;
}>(({ onClick, color = 'rgba(255,255,255,0.5)' }) => (
  <Box
    component='button'
    onClick={(e: React.MouseEvent) => {
      e.stopPropagation();
      onClick();
    }}
    title='Edit'
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      p: 0,
      border: '1.5px solid rgba(255,255,255,0.25)',
      borderRadius: '6px',
      bgcolor: 'transparent',
      color,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      '&:hover': {
        bgcolor: 'rgba(255,255,255,0.25)',
        borderColor: 'rgba(255,255,255,0.5)',
      },
    }}
  >
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
      <path d='m15 5 4 4' />
    </svg>
  </Box>
));
EditButton.displayName = 'EditButton';

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

// ══════════════════════════════════════
// Grey Scale Card + Edit Dialog
// ══════════════════════════════════════

const GreyEditDialog = memo<{
  open: boolean;
  onClose: () => void;
  grey: ThemeTokens['grey'];
  onUpdate: (grey: ThemeTokens['grey']) => void;
}>(({ open, onClose, grey, onUpdate }) => {
  const keys = Object.keys(grey.light).sort((a, b) => Number(a) - Number(b));

  const handleEdit = (mode: 'light' | 'dark', shade: string, value: string) => {
    onUpdate({
      ...grey,
      [mode]: { ...grey[mode], [shade]: value },
    });
  };

  const handleAdd = (shade: string) => {
    if (grey.light[shade]) return;
    onUpdate({
      light: { ...grey.light, [shade]: '#9e9e9e' },
      dark: { ...grey.dark, [shade]: '#616161' },
    });
  };

  const handleRemove = (shade: string) => {
    const lightRest = { ...grey.light }; delete lightRest[shade];
    const darkRest = { ...grey.dark }; delete darkRest[shade];
    onUpdate({ light: lightRest, dark: darkRest });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ background: '#616161', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Grey</Typography>
        <IconButton onClick={onClose} size='small' sx={{ color: 'inherit', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
            <polyline points='20 6 9 17 4 12' />
          </svg>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 32px', gap: 1, alignItems: 'center' }}>
          <Box />
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(0,0,0,0.4)' }}>Light</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(0,0,0,0.4)' }}>Dark</Typography>
          <Box />
          {keys.map(shade => (
            <React.Fragment key={shade}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', fontFamily: '"JetBrains Mono", monospace' }}>{shade}</Typography>
              <EditCell value={grey.light[shade]} onChange={v => handleEdit('light', shade, v)} />
              <EditCell value={grey.dark[shade]} onChange={v => handleEdit('dark', shade, v)} />
              <DeleteBtn onClick={() => handleRemove(shade)} />
            </React.Fragment>
          ))}
        </Box>
        <Box sx={{ mt: 2 }}>
          <AddRow placeholder='e.g. 850' onAdd={handleAdd} />
        </Box>
      </DialogContent>
    </Dialog>
  );
});
GreyEditDialog.displayName = 'GreyEditDialog';

export const GreyScaleCard = memo<{
  grey: ThemeTokens['grey'];
  onUpdate?: (grey: ThemeTokens['grey']) => void;
}>(({ grey, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const keys = Object.keys(grey.light).sort((a, b) => Number(a) - Number(b));

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
    setCopiedText(text.length > 20 ? 'Copied!' : text);
    setSnackOpen(true);
  }, []);

  return (
    <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <Box sx={{ background: '#616161', px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 700, color: '#fff', fontSize: '0.8rem' }}>Grey</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography variant='caption' sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
            {keys[0]}–{keys[keys.length - 1]}
          </Typography>
          {onUpdate && <EditButton onClick={() => setDialogOpen(true)} />}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, p: 1, bgcolor: '#fff' }}>
        <TokenColumn mode='light' onCopy={handleCopy} copyData={grey.light}>
          {keys.map(k => (
            <TokenSwatch key={k} label={k} value={grey.light[k]} isDark={false} onCopy={handleCopy} />
          ))}
        </TokenColumn>
        <TokenColumn mode='dark' onCopy={handleCopy} copyData={grey.dark}>
          {keys.map(k => (
            <TokenSwatch key={k} label={k} value={grey.dark[k]} isDark={true} onCopy={handleCopy} />
          ))}
        </TokenColumn>
      </Box>
      {onUpdate && (
        <GreyEditDialog open={dialogOpen} onClose={() => setDialogOpen(false)} grey={grey} onUpdate={onUpdate} />
      )}
      <Snackbar open={snackOpen} autoHideDuration={1200} onClose={() => setSnackOpen(false)} message={`Copied: ${copiedText}`} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
});
GreyScaleCard.displayName = 'GreyScaleCard';

// ══════════════════════════════════════
// Utility Tokens Card + Edit Dialog
// ══════════════════════════════════════

const UtilityEditDialog = memo<{
  open: boolean;
  onClose: () => void;
  utility: ThemeTokens['utility'];
  onUpdate: (utility: ThemeTokens['utility']) => void;
}>(({ open, onClose, utility, onUpdate }) => {
  const groups = Object.keys(utility.light);

  const handleEdit = (mode: 'light' | 'dark', group: string, key: string, value: string) => {
    onUpdate({
      ...utility,
      [mode]: {
        ...utility[mode],
        [group]: { ...utility[mode][group], [key]: value },
      },
    });
  };

  const handleAddEntry = (group: string, key: string) => {
    if (utility.light[group]?.[key]) return;
    onUpdate({
      light: { ...utility.light, [group]: { ...utility.light[group], [key]: '#000000' } },
      dark: { ...utility.dark, [group]: { ...utility.dark[group], [key]: '#ffffff' } },
    });
  };

  const handleRemoveEntry = (group: string, key: string) => {
    const lightRest = { ...utility.light[group] }; delete lightRest[key];
    const darkRest = { ...utility.dark[group] }; delete darkRest[key];
    onUpdate({
      light: { ...utility.light, [group]: lightRest },
      dark: { ...utility.dark, [group]: darkRest },
    });
  };

  const handleAddGroup = (group: string) => {
    if (utility.light[group]) return;
    onUpdate({
      light: { ...utility.light, [group]: { default: '#000000' } },
      dark: { ...utility.dark, [group]: { default: '#ffffff' } },
    });
  };

  const handleRemoveGroup = (group: string) => {
    const lightRest = { ...utility.light }; delete lightRest[group];
    const darkRest = { ...utility.dark }; delete darkRest[group];
    onUpdate({ light: lightRest, dark: darkRest });
  };

  const handleRenameGroup = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName || utility.light[trimmed]) return;
    const rebuild = (obj: Record<string, Record<string, string>>) => {
      const result: Record<string, Record<string, string>> = {};
      for (const k of Object.keys(obj)) {
        result[k === oldName ? trimmed : k] = obj[k];
      }
      return result;
    };
    onUpdate({ light: rebuild(utility.light), dark: rebuild(utility.dark) });
  };

  const handleRenameEntry = (group: string, oldKey: string, newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed || trimmed === oldKey || utility.light[group][trimmed]) return;
    const rebuild = (obj: Record<string, string>) => {
      const result: Record<string, string> = {};
      for (const k of Object.keys(obj)) {
        result[k === oldKey ? trimmed : k] = obj[k];
      }
      return result;
    };
    onUpdate({
      light: { ...utility.light, [group]: rebuild(utility.light[group]) },
      dark: { ...utility.dark, [group]: rebuild(utility.dark[group]) },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #334155, #1e293b)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Utility Tokens</Typography>
        <IconButton onClick={onClose} size='small' sx={{ color: 'inherit', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
            <polyline points='20 6 9 17 4 12' />
          </svg>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
        {groups.map(group => {
          const entries = Object.keys(utility.light[group]);
          return (
            <Box key={group} sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                <TextField
                  size='small'
                  defaultValue={group}
                  onBlur={e => handleRenameGroup(group, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                  sx={{
                    flex: 1,
                    '& input': {
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      color: 'rgba(0,0,0,0.7)',
                      py: 0.5,
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
                    },
                  }}
                />
                <DeleteBtn onClick={() => handleRemoveGroup(group)} title={`Remove ${group} group`} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 32px', gap: 1, alignItems: 'center' }}>
                <Box />
                <Typography sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(0,0,0,0.35)' }}>Light</Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(0,0,0,0.35)' }}>Dark</Typography>
                <Box />
                {entries.map(key => (
                  <React.Fragment key={key}>
                    <TextField
                      size='small'
                      defaultValue={key}
                      onBlur={e => handleRenameEntry(group, key, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      sx={{
                        '& input': {
                          fontWeight: 500,
                          fontSize: '0.8rem',
                          fontFamily: '"JetBrains Mono", monospace',
                          color: '#1a1a2e',
                          py: 0.5,
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '6px',
                          '& fieldset': { borderColor: 'transparent' },
                          '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
                        },
                      }}
                    />
                    <EditCell value={utility.light[group][key]} onChange={v => handleEdit('light', group, key, v)} />
                    <EditCell value={utility.dark[group][key]} onChange={v => handleEdit('dark', group, key, v)} />
                    <DeleteBtn onClick={() => handleRemoveEntry(group, key)} />
                  </React.Fragment>
                ))}
              </Box>
              <AddRow placeholder='entry key' onAdd={k => handleAddEntry(group, k)} />
            </Box>
          );
        })}
        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', pt: 2 }}>
          <AddRow placeholder='group name' onAdd={handleAddGroup} />
        </Box>
      </DialogContent>
    </Dialog>
  );
});
UtilityEditDialog.displayName = 'UtilityEditDialog';

export const UtilityTokensCard = memo<{
  utility: ThemeTokens['utility'];
  onUpdate?: (utility: ThemeTokens['utility']) => void;
}>(({ utility, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const groups = Object.keys(utility.light);

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
    setCopiedText(text.length > 20 ? 'Copied!' : text);
    setSnackOpen(true);
  }, []);

  return (
    <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #334155, #1e293b)', px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 700, color: '#fff', fontSize: '0.8rem' }}>Utility Tokens</Typography>
        {onUpdate && <EditButton onClick={() => setDialogOpen(true)} />}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, p: 1, bgcolor: '#fff' }}>
        <TokenColumn mode='light' onCopy={handleCopy} copyData={utility.light}>
          {groups.map(group => (
            <React.Fragment key={group}>
              <GroupLabel label={group} isDark={false} />
              {Object.entries(utility.light[group]).map(([k, v]) => (
                <TokenSwatch key={k} label={k} value={v} isDark={false} onCopy={handleCopy} />
              ))}
            </React.Fragment>
          ))}
        </TokenColumn>
        <TokenColumn mode='dark' onCopy={handleCopy} copyData={utility.dark}>
          {groups.map(group => (
            <React.Fragment key={group}>
              <GroupLabel label={group} isDark={true} />
              {Object.entries(utility.dark[group]).map(([k, v]) => (
                <TokenSwatch key={k} label={k} value={v} isDark={true} onCopy={handleCopy} />
              ))}
            </React.Fragment>
          ))}
        </TokenColumn>
      </Box>
      {onUpdate && (
        <UtilityEditDialog open={dialogOpen} onClose={() => setDialogOpen(false)} utility={utility} onUpdate={onUpdate} />
      )}
      <Snackbar open={snackOpen} autoHideDuration={1200} onClose={() => setSnackOpen(false)} message={`Copied: ${copiedText}`} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
});
UtilityTokensCard.displayName = 'UtilityTokensCard';

// ══════════════════════════════════════
// Utility Group Card (single category)
// ══════════════════════════════════════

export const UtilityGroupCard = memo<{
  groupName: string;
  utility: ThemeTokens['utility'];
  onUpdate?: (utility: ThemeTokens['utility']) => void;
}>(({ groupName, utility, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
    setCopiedText(text.length > 20 ? 'Copied!' : text);
    setSnackOpen(true);
  }, []);

  const lightEntries = utility.light[groupName] ?? {};
  const darkEntries = utility.dark[groupName] ?? {};
  const entryKeys = Object.keys(lightEntries);

  return (
    <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #475569, #334155)', px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 700, color: '#fff', fontSize: '0.8rem', textTransform: 'capitalize' }}>
          {groupName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
            {entryKeys.length} {entryKeys.length === 1 ? 'token' : 'tokens'}
          </Typography>
          {onUpdate && <EditButton onClick={() => setDialogOpen(true)} />}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, p: 1, bgcolor: '#fff' }}>
        <TokenColumn mode='light' onCopy={handleCopy} copyData={lightEntries}>
          {entryKeys.map(k => (
            <TokenSwatch
              key={k}
              label={k}
              value={lightEntries[k]}
              isDark={false}
              onCopy={handleCopy}
              tintMode={groupName === 'text' ? 'fg' : 'bg'}
            />
          ))}
        </TokenColumn>
        <TokenColumn mode='dark' onCopy={handleCopy} copyData={darkEntries}>
          {entryKeys.map(k => (
            <TokenSwatch
              key={k}
              label={k}
              value={darkEntries[k]}
              isDark={true}
              onCopy={handleCopy}
              tintMode={groupName === 'text' ? 'fg' : 'bg'}
            />
          ))}
        </TokenColumn>
      </Box>
      {onUpdate && (
        <UtilityEditDialog open={dialogOpen} onClose={() => setDialogOpen(false)} utility={utility} onUpdate={onUpdate} />
      )}
      <Snackbar open={snackOpen} autoHideDuration={1200} onClose={() => setSnackOpen(false)} message={`Copied: ${copiedText}`} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
});
UtilityGroupCard.displayName = 'UtilityGroupCard';

// ══════════════════════════════════════
// Add Group Card (empty placeholder)
// ══════════════════════════════════════

export const AddGroupCard = memo<{
  utility: ThemeTokens['utility'];
  onUpdate: (utility: ThemeTokens['utility']) => void;
}>(({ utility, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const name = groupName.trim();
    if (!name) return;
    if (utility.light[name]) {
      setError('Group already exists');
      return;
    }
    onUpdate({
      light: { ...utility.light, [name]: { default: '#000000' } },
      dark: { ...utility.dark, [name]: { default: '#ffffff' } },
    });
    setGroupName('');
    setError('');
    setDialogOpen(false);
  };

  return (
    <>
      <Box
        onClick={() => setDialogOpen(true)}
        sx={{
          borderRadius: '12px',
          border: '2px dashed rgba(0,0,0,0.15)',
          bgcolor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 180,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#3f50b5',
            bgcolor: 'rgba(63,80,181,0.04)',
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='rgba(0,0,0,0.5)' strokeWidth='2.5' strokeLinecap='round'>
            <line x1='12' y1='5' x2='12' y2='19' />
            <line x1='5' y1='12' x2='19' y2='12' />
          </svg>
        </Box>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)' }}>
          Add Token Group
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', mt: 0.25 }}>
          e.g. icon, chart, status
        </Typography>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setError(''); }}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
          New Token Group
        </DialogTitle>
        <DialogContent>
          <TextField
            value={groupName}
            onChange={e => { setGroupName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder='e.g. icon, chart, status'
            fullWidth
            size='small'
            autoFocus
            error={!!error}
            helperText={error}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setDialogOpen(false); setError(''); }} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            variant='contained'
            disabled={!groupName.trim()}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
AddGroupCard.displayName = 'AddGroupCard';

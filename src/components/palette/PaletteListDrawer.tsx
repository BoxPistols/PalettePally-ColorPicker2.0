import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import { PaletteDocument } from '@/lib/types/palette';
import * as firestoreService from '@/lib/firebase/firestore';

type PaletteListDrawerProps = {
  open: boolean;
  onClose: () => void;
  uid: string;
  onLoad: (palette: PaletteDocument) => void;
  onDelete: (paletteId: string, name: string) => Promise<boolean>;
};

export const PaletteListDrawer = memo<PaletteListDrawerProps>(
  ({ open, onClose, uid, onLoad, onDelete }) => {
    const [palettes, setPalettes] = useState<PaletteDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // 再オープン/再読み込みで並行実行されたとき、遅れて返った古い fetch が
    // 最新の結果を上書きしないよう、最新リクエストの結果だけを反映する
    const reqRef = useRef(0);

    const fetchPalettes = useCallback(async () => {
      const reqId = ++reqRef.current;
      setLoading(true);
      setError('');
      try {
        const list = await firestoreService.listPalettes(uid);
        if (reqRef.current === reqId) setPalettes(list);
      } catch {
        // 以前は握りつぶしており、失敗時も「No saved palettes」と表示され区別不能だった
        if (reqRef.current === reqId) setError('パレットの読み込みに失敗しました');
      } finally {
        if (reqRef.current === reqId) setLoading(false);
      }
    }, [uid]);

    useEffect(() => {
      if (open) fetchPalettes();
    }, [open, fetchPalettes]);

    const handleDelete = async (id: string, name: string) => {
      const confirmed = await onDelete(id, name);
      if (confirmed) {
        setPalettes(prev => prev.filter(p => p.id !== id));
      }
    };

    const formatDate = (d: Date | { toDate?: () => Date } | undefined) => {
      if (!d) return '';
      const date = typeof (d as { toDate?: () => Date }).toDate === 'function'
        ? (d as { toDate: () => Date }).toDate()
        : d as Date;
      return new Intl.DateTimeFormat('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    return (
      <Drawer
        anchor='right'
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: 320, borderRadius: '16px 0 0 16px' } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
            My Palettes
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </IconButton>
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Typography role='alert' sx={{ color: 'error.main', fontSize: '0.85rem', mb: 1.5 }}>
              {error}
            </Typography>
            <Button size='small' variant='outlined' onClick={fetchPalettes} sx={{ textTransform: 'none' }}>
              再読み込み
            </Button>
          </Box>
        ) : palettes.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              No saved palettes
            </Typography>
          </Box>
        ) : (
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {palettes.map(p => (
              <ListItemButton
                key={p.id}
                onClick={() => { onLoad(p); onClose(); }}
                sx={{ px: 2, py: 1.5 }}
              >
                <ListItemText
                  primary={p.name}
                  secondary={`v${p.currentVersion} — ${formatDate(p.updatedAt)}`}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  {p.data.colors?.slice(0, 4).map((c, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '3px',
                        bgcolor: c,
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                  ))}
                  <IconButton
                    size='small'
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(p.id, p.name);
                    }}
                    sx={{
                      ml: 0.5,
                      width: 28,
                      height: 28,
                      color: 'text.secondary',
                      '&:hover': { color: 'error.main' },
                    }}
                  >
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <polyline points='3 6 5 6 21 6' />
                      <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                    </svg>
                  </IconButton>
                </Box>
              </ListItemButton>
            ))}
          </List>
        )}
      </Drawer>
    );
  }
);

PaletteListDrawer.displayName = 'PaletteListDrawer';

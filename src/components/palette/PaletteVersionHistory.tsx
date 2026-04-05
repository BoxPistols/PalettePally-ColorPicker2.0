import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import { PaletteVersion } from '@/lib/types/palette';
import * as firestoreService from '@/lib/firebase/firestore';

type PaletteVersionHistoryProps = {
  open: boolean;
  onClose: () => void;
  paletteId: string;
  paletteName: string;
  onRestore: (versionId: string, version: number) => Promise<boolean>;
};

export const PaletteVersionHistory = memo<PaletteVersionHistoryProps>(
  ({ open, onClose, paletteId, paletteName, onRestore }) => {
    const [versions, setVersions] = useState<PaletteVersion[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchVersions = useCallback(async () => {
      setLoading(true);
      try {
        const list = await firestoreService.getVersionHistory(paletteId);
        setVersions(list);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, [paletteId]);

    useEffect(() => {
      if (open) fetchVersions();
    }, [open, fetchVersions]);

    const formatDate = (d: Date | { toDate?: () => Date } | undefined) => {
      if (!d) return '';
      const date = typeof (d as { toDate?: () => Date }).toDate === 'function'
        ? (d as { toDate: () => Date }).toDate()
        : d as Date;
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
              Version History
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {paletteName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size='small'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : versions.length === 0 ? (
            <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                No versions
              </Typography>
            </Box>
          ) : (
            <List>
              {versions.map((v, idx) => (
                <ListItemButton
                  key={v.id}
                  onClick={() => onRestore(v.id, v.version)}
                  disabled={idx === 0}
                  sx={{ px: 3, py: 1.5 }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {v.label}
                        </Typography>
                        {idx === 0 && (
                          <Chip label='current' size='small' color='primary' sx={{ height: 20, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component='span'>
                        {formatDate(v.createdAt)}
                        {v.changeNote && ` — ${v.changeNote}`}
                      </Box>
                    }
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                  {idx > 0 && (
                    <Typography sx={{ fontSize: '0.75rem', color: 'primary.main', flexShrink: 0 }}>
                      Restore
                    </Typography>
                  )}
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

PaletteVersionHistory.displayName = 'PaletteVersionHistory';

import React, { memo, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
} from '@mui/material';
import { ParsedVariable } from '@/lib/figma/types';

type FigmaImportDialogProps = {
  open: boolean;
  onClose: () => void;
  fileKey: string;
  pat: string;
  onImport: (variables: ParsedVariable[]) => void;
  onConfirm: () => Promise<boolean>;
};

export const FigmaImportDialog = memo<FigmaImportDialogProps>(
  ({ open, onClose, fileKey, pat, onImport, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [variables, setVariables] = useState<ParsedVariable[]>([]);
    const [collections, setCollections] = useState<string[]>([]);

    useEffect(() => {
      if (!open) return;
      setLoading(true);
      setError('');
      setVariables([]);

      fetch(`/api/figma/variables?fileKey=${fileKey}`, {
        headers: { 'X-Figma-Token': pat },
      })
        .then(async res => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed (${res.status})`);
          }
          return res.json();
        })
        .then(data => {
          setVariables(data.variables ?? []);
          setCollections(data.collections ?? []);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to load');
        })
        .finally(() => setLoading(false));
    }, [open, fileKey, pat]);

    const handleImport = async () => {
      const confirmed = await onConfirm();
      if (!confirmed) return;
      onImport(variables);
      onClose();
    };

    const colorVars = variables.filter(v => v.lightValue.startsWith('#'));

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
          Import from Figma Variables
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          {error && (
            <Alert severity='error' sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : variables.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
              No color variables found in this file
            </Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {collections.map(c => (
                  <Chip key={c} label={c} size='small' variant='outlined' />
                ))}
              </Box>

              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 1 }}>
                {colorVars.length} color variables found:
              </Typography>

              <List
                dense
                sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '8px',
                }}
              >
                {colorVars.slice(0, 50).map((v, i) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.75, mr: 1.5 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '3px',
                          bgcolor: v.lightValue,
                          border: '1px solid rgba(0,0,0,0.1)',
                        }}
                      />
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '3px',
                          bgcolor: v.darkValue,
                          border: '1px solid rgba(0,0,0,0.1)',
                        }}
                      />
                    </Box>
                    <ListItemText
                      primary={v.name}
                      secondary={`${v.collection}`}
                      primaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                      secondaryTypographyProps={{ fontSize: '0.7rem' }}
                    />
                  </ListItem>
                ))}
                {colorVars.length > 50 && (
                  <ListItem>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      ...and {colorVars.length - 50} more
                    </Typography>
                  </ListItem>
                )}
              </List>

              <Alert severity='warning' sx={{ mt: 2, borderRadius: '8px', fontSize: '0.8rem' }}>
                現在のパレットが Figma の Variables で上書きされます。
                命名規則 <code>{'{name}/{light|dark}/{shade}'}</code> に従う Variables は
                MUI 5 シェード構造 (main/dark/light/lighter/contrastText) に自動復元されます。
              </Alert>
              <Alert severity='info' sx={{ mt: 1, borderRadius: '8px', fontSize: '0.78rem' }}>
                REST API Import は Enterprise プラン限定です。非 Enterprise では
                <strong> PalettePally Figma Plugin </strong>
                から DTCG JSON をエクスポートし、Import Hub でペーストしてください。
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant='contained'
            disabled={loading || colorVars.length === 0}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Import {colorVars.length} Variables
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

FigmaImportDialog.displayName = 'FigmaImportDialog';

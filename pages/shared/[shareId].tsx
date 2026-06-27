import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, CircularProgress, Container } from '@mui/material';
import { PaletteCard } from '@/components/PaletteGrid';
import { PaletteDocument } from '@/lib/types/palette';
import * as firestoreService from '@/lib/firebase/firestore';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { t } from '@/lib/i18n';

export default function SharedPalettePage() {
  const router = useRouter();
  const { shareId } = router.query;
  const { user } = useAuthContext();
  const [palette, setPalette] = useState<PaletteDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    if (!shareId || typeof shareId !== 'string') return;
    firestoreService
      .loadSharedPalette(shareId)
      .then(p => {
        setPalette(p);
        if (!p) setError(t.sharedPage.errorNotFoundOrExpired);
      })
      .catch(() => setError(t.sharedPage.errorLoadFailed))
      .finally(() => setLoading(false));
  }, [shareId]);

  const handleDuplicate = async () => {
    if (!palette || !user) return;
    setDuplicating(true);
    try {
      // 複製は閲覧者が自分のパレットとして新規保存する（owner 限定ルール下でも成立）。
      // 共有スナップショットの data をそのまま使うため元パレットの直接読み取りは不要。
      await firestoreService.savePalette(
        user.uid,
        palette.data,
        t.sharedPage.duplicateName(palette.name),
        t.sharedPage.duplicateDescription(palette.name)
      );
      router.push('/');
    } catch {
      setError(t.sharedPage.errorDuplicateFailed);
    } finally {
      setDuplicating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !palette) {
    return (
      <Container maxWidth='sm' sx={{ py: 8, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 1 }}>
          {error || t.sharedPage.notFound}
        </Typography>
        <Button href='/' sx={{ textTransform: 'none' }}>
          {t.sharedPage.backToGenerator}
        </Button>
      </Container>
    );
  }

  const { data } = palette;

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {palette.name}
          </Typography>
          {palette.description && (
            <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
              {palette.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {palette.sharePermission === 'duplicate' && user && (
            <Button
              variant='contained'
              onClick={handleDuplicate}
              disabled={duplicating}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
            >
              {duplicating ? '...' : t.sharedPage.duplicateToMyAccount}
            </Button>
          )}
          <Button href='/' variant='outlined' sx={{ textTransform: 'none', borderRadius: '8px' }}>
            {t.sharedPage.generator}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
        {data.palette?.map((entry, idx) => {
          const [name, colorPalette] = Object.entries(entry)[0];
          return (
            <PaletteCard
              key={idx}
              colorPalette={colorPalette}
              colorName={name}
            />
          );
        })}
      </Box>
    </Container>
  );
}

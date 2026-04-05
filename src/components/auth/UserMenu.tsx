import React, { memo, useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import { useAuthContext } from './AuthProvider';

type UserMenuProps = {
  onOpenPalettes?: () => void;
};

export const UserMenu = memo<UserMenuProps>(({ onOpenPalettes }) => {
  const { user, signOut } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!user) return null;

  const initial = (user.email?.[0] ?? '?').toUpperCase();

  return (
    <>
      <IconButton
        onClick={e => setAnchorEl(e.currentTarget)}
        size='small'
        sx={{
          width: 34,
          height: 34,
          borderRadius: '8px',
          bgcolor: '#3f50b5',
          color: '#fff',
          fontSize: '0.8rem',
          fontWeight: 700,
          '&:hover': { bgcolor: '#303f9f' },
        }}
      >
        {initial}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { borderRadius: '12px', minWidth: 200, mt: 0.5 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Signed in as
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, wordBreak: 'break-all' }}>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        {onOpenPalettes && (
          <MenuItem
            onClick={() => { setAnchorEl(null); onOpenPalettes(); }}
            sx={{ fontSize: '0.85rem' }}
          >
            My Palettes
          </MenuItem>
        )}
        <MenuItem
          onClick={() => { setAnchorEl(null); signOut(); }}
          sx={{ fontSize: '0.85rem', color: 'error.main' }}
        >
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
});

UserMenu.displayName = 'UserMenu';

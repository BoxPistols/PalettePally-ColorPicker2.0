import React, { memo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuthContext } from './AuthProvider';
import { t } from '@/lib/i18n';

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const LoginDialog = memo<LoginDialogProps>(({ open, onClose }) => {
  const { signIn, signUp } = useAuthContext();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.loginDialog.authFailed;
      setError(msg.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setError(''); }}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
        >
          <Tab label={t.loginDialog.tabLogin} value='login' />
          <Tab label={t.loginDialog.tabSignUp} value='signup' />
        </Tabs>
      </DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}
        <TextField
          label={t.loginDialog.emailLabel}
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          size='small'
          sx={{ mb: 2 }}
          autoFocus
        />
        <TextField
          label={t.loginDialog.passwordLabel}
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          fullWidth
          size='small'
          inputProps={{ minLength: 6 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          {t.loginDialog.cancel}
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading || !email || !password}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
        >
          {loading ? '...' : tab === 'login' ? t.loginDialog.submitLogin : t.loginDialog.submitCreateAccount}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

LoginDialog.displayName = 'LoginDialog';

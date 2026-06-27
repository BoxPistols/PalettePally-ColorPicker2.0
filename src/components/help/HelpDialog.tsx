import React, { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { t } from '@/lib/i18n';

type HelpDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const HelpDialog = memo<HelpDialogProps>(({ open, onClose }) => {
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
        <Box>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {t.helpDialog.title}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
            {t.helpDialog.subtitle}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size='small'>
          <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <line x1='18' y1='6' x2='6' y2='18' />
            <line x1='6' y1='6' x2='18' y2='18' />
          </svg>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Typography
          sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 3, lineHeight: 1.7 }}
        >
          {t.helpDialog.intro}
        </Typography>

        <Step
          num={1}
          title={t.helpDialog.step1Title}
          description={t.helpDialog.step1Desc}
          tips={[
            t.helpDialog.step1Tip1,
            t.helpDialog.step1Tip2,
            t.helpDialog.step1Tip3,
          ]}
        />

        <Step
          num={2}
          title={t.helpDialog.step2Title}
          description={t.helpDialog.step2Desc}
          tips={[
            t.helpDialog.step2Tip1,
            t.helpDialog.step2Tip2,
            t.helpDialog.step2Tip3,
            t.helpDialog.step2Tip4,
          ]}
        />

        <Step
          num={3}
          title={t.helpDialog.step3Title}
          description={t.helpDialog.step3Desc}
          tips={[
            t.helpDialog.step3Tip1,
            t.helpDialog.step3Tip2,
            t.helpDialog.step3Tip3,
          ]}
        />

        <Step
          num={4}
          title={t.helpDialog.step4Title}
          description={t.helpDialog.step4Desc}
          tips={[
            t.helpDialog.step4Tip1,
            t.helpDialog.step4Tip2,
            t.helpDialog.step4Tip3,
          ]}
        />

        <Step
          num={5}
          title={t.helpDialog.step5Title}
          description={t.helpDialog.step5Desc}
          tips={[
            t.helpDialog.step5Tip1,
            t.helpDialog.step5Tip2,
            t.helpDialog.step5Tip3,
          ]}
        />

        <Step
          num={6}
          title={t.helpDialog.step6Title}
          description={t.helpDialog.step6Desc}
          tips={[
            t.helpDialog.step6Tip1,
            t.helpDialog.step6Tip2,
            t.helpDialog.step6Tip3,
          ]}
        />

        <Step
          num={7}
          title={t.helpDialog.step7Title}
          description={t.helpDialog.step7Desc}
          tips={[
            t.helpDialog.step7Tip1,
            t.helpDialog.step7Tip2,
            t.helpDialog.step7Tip3,
            t.helpDialog.step7Tip4,
          ]}
        />

        <Box sx={{ mt: 4 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 2 }}>
            {t.helpDialog.faqHeading}
          </Typography>
          <Faq q={t.helpDialog.faq1Q} a={t.helpDialog.faq1A} />
          <Faq q={t.helpDialog.faq2Q} a={t.helpDialog.faq2A} />
          <Faq q={t.helpDialog.faq3Q} a={t.helpDialog.faq3A} />
          <Faq q={t.helpDialog.faq4Q} a={t.helpDialog.faq4A} />
          <Faq q={t.helpDialog.faq5Q} a={t.helpDialog.faq5A} />
        </Box>
      </DialogContent>
    </Dialog>
  );
});
HelpDialog.displayName = 'HelpDialog';

function Step({
  num,
  title,
  description,
  tips,
}: {
  num: number;
  title: string;
  description: string;
  tips: string[];
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '10px',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box
          sx={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: '#4A5EC4',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          {num}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 0.75 }}>
            {title}
          </Typography>
          <Typography
            sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 1, lineHeight: 1.6 }}
          >
            {description}
          </Typography>
          <Box component='ul' sx={{ m: 0, pl: 2.5 }}>
            {tips.map((tip, i) => (
              <Typography
                component='li'
                key={i}
                sx={{
                  fontSize: '0.8rem',
                  color: 'text.secondary',
                  mb: 0.25,
                  lineHeight: 1.6,
                }}
              >
                {tip}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, mb: 0.5 }}>{q}</Typography>
      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.7 }}>
        {a}
      </Typography>
    </Box>
  );
}

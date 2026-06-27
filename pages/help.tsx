import React from 'react';
import { Container, Box, Typography, Paper, Button, Divider } from '@mui/material';
import { t } from '@/lib/i18n';

export default function HelpPage() {
  return (
    <Container maxWidth='md' sx={{ py: 5 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#1a1a2e' }}>
          {t.helpPage.headerTitle}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button href='/' variant='outlined' size='small' sx={{ textTransform: 'none', borderRadius: '8px' }}>
            {t.helpPage.navGenerator}
          </Button>
          <Button href='/example' size='small' sx={{ textTransform: 'none', borderRadius: '8px' }}>
            {t.helpPage.navExample}
          </Button>
        </Box>
      </Box>

      <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
        {t.helpPage.intro}
      </Typography>

      {/* Step 1 */}
      <Step
        num={1}
        title={t.helpPage.step1Title}
        description={t.helpPage.step1Desc}
        tips={[
          t.helpPage.step1Tip1,
          t.helpPage.step1Tip2,
          t.helpPage.step1Tip3,
        ]}
      />

      {/* Step 2 */}
      <Step
        num={2}
        title={t.helpPage.step2Title}
        description={t.helpPage.step2Desc}
        tips={[
          t.helpPage.step2Tip1,
          t.helpPage.step2Tip2,
          t.helpPage.step2Tip3,
          t.helpPage.step2Tip4,
        ]}
      />

      {/* Step 3 */}
      <Step
        num={3}
        title={t.helpPage.step3Title}
        description={t.helpPage.step3Desc}
        tips={[
          t.helpPage.step3Tip1,
          t.helpPage.step3Tip2,
          t.helpPage.step3Tip3,
        ]}
      />

      {/* Step 4 */}
      <Step
        num={4}
        title={t.helpPage.step4Title}
        description={t.helpPage.step4Desc}
        tips={[
          t.helpPage.step4Tip1,
          t.helpPage.step4Tip2,
          t.helpPage.step4Tip3,
        ]}
      />

      {/* Step 5 */}
      <Step
        num={5}
        title={t.helpPage.step5Title}
        description={t.helpPage.step5Desc}
        tips={[
          t.helpPage.step5Tip1,
          t.helpPage.step5Tip2,
          t.helpPage.step5Tip3,
        ]}
      />

      {/* Step 6 */}
      <Step
        num={6}
        title={t.helpPage.step6Title}
        description={t.helpPage.step6Desc}
        tips={[
          t.helpPage.step6Tip1,
          t.helpPage.step6Tip2,
          t.helpPage.step6Tip3,
        ]}
      />

      {/* Step 7 */}
      <Step
        num={7}
        title={t.helpPage.step7Title}
        description={t.helpPage.step7Desc}
        tips={[
          t.helpPage.step7Tip1,
          t.helpPage.step7Tip2,
          t.helpPage.step7Tip3,
          t.helpPage.step7Tip4,
        ]}
      />

      {/* FAQ */}
      <Box sx={{ mt: 6 }}>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mb: 2 }}>
          {t.helpPage.faqHeading}
        </Typography>
        <Faq
          q={t.helpPage.faq1Q}
          a={t.helpPage.faq1A}
        />
        <Faq
          q={t.helpPage.faq2Q}
          a={t.helpPage.faq2A}
        />
        <Faq
          q={t.helpPage.faq3Q}
          a={t.helpPage.faq3A}
        />
        <Faq
          q={t.helpPage.faq4Q}
          a={t.helpPage.faq4A}
        />
        <Faq
          q={t.helpPage.faq5Q}
          a={t.helpPage.faq5A}
        />
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* フッター */}
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2 }}>
          {t.helpPage.footerMore}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          <Button href='/' variant='contained' sx={{ textTransform: 'none', borderRadius: '8px' }}>
            {t.helpPage.footerOpenGenerator}
          </Button>
          <Button href='/example' variant='outlined' sx={{ textTransform: 'none', borderRadius: '8px' }}>
            {t.helpPage.footerSeeExample}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

function Step({
  num, title, description, tips,
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
        p: 3,
        mb: 2.5,
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '12px',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box
          sx={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#4A5EC4',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          {num}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 1 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 1.5, lineHeight: 1.6 }}>
            {description}
          </Typography>
          <Box component='ul' sx={{ m: 0, pl: 2.5 }}>
            {tips.map((tip, i) => (
              <Typography
                component='li'
                key={i}
                sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 0.5, lineHeight: 1.6 }}
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
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, mb: 0.5 }}>
        {q}
      </Typography>
      <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', lineHeight: 1.7 }}>
        {a}
      </Typography>
    </Box>
  );
}

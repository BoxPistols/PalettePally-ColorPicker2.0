import React from 'react';
import { Container, Box, Typography, Paper, Button, Divider } from '@mui/material';

export default function HelpPage() {
  return (
    <Container maxWidth='md' sx={{ py: 5 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#1a1a2e' }}>
          使い方ガイド
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button href='/' variant='outlined' size='small' sx={{ textTransform: 'none', borderRadius: '8px' }}>
            Generator
          </Button>
          <Button href='/example' size='small' sx={{ textTransform: 'none', borderRadius: '8px' }}>
            Example
          </Button>
        </Box>
      </Box>

      <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
        Palette Pally は、MUI (Material-UI) 互換のカラーパレットを生成するツールです。
        シードカラーを選ぶだけで、light / dark 両対応の5色パレット + グレースケール + ユーティリティトークンを自動生成できます。
      </Typography>

      {/* Step 1 */}
      <Step
        num={1}
        title='カラーを選ぶ'
        description='各カラーピッカーで HEX 値 / RGB / プリセットから色を選択します。カラー数は 1〜24 まで変更可能。'
        tips={[
          '1番目の色が Primary (main theme color) として扱われます',
          'Primary から Grey / Utility Tokens が自動導出されます',
          'カラー名は任意で変更可能 (例: color1 → brand)',
        ]}
      />

      {/* Step 2 */}
      <Step
        num={2}
        title='パレットが自動生成される'
        description='各色に対して Material Design 3 ベースの 5段階パレット (main / dark / light / lighter / contrastText) が light / dark 両モードで生成されます。'
        tips={[
          'main はあなたが入力した HEX 値そのまま',
          'dark / light / lighter は TonalPalette から導出',
          'contrastText は輝度に応じて pure white / black (WCAG 準拠)',
          '無彩色を入力すると純粋グレースケールに (ティール色にならない)',
        ]}
      />

      {/* Step 3 */}
      <Step
        num={3}
        title='パレットを微調整する'
        description='各カードの右上ペンアイコン をクリックすると編集 Dialog が開きます。個別の色をカラーピッカー / HEX で編集できます。'
        tips={[
          'Light / Dark のすべての shade を個別に編集可能',
          'Theme Tokens (Grey / text / background 等) も同様に編集',
          '編集内容はリロード後も保持 (localStorage)',
        ]}
      />

      {/* Step 4 */}
      <Step
        num={4}
        title='トークングループを追加する'
        description='Utility Tokens セクションの「+ Add Token Group」から独自のトークンカテゴリを追加できます。'
        tips={[
          '例: icon (white / light / dark / action / disabled)',
          '例: chart (category1 / category2 / category3)',
          '例: status (online / offline / busy)',
        ]}
      />

      {/* Step 5 */}
      <Step
        num={5}
        title='Example ページでプレビュー'
        description='ヘッダーの「Example」リンクから、生成したパレットを使った MUI コンポーネントのプレビューを確認できます。'
        tips={[
          'Button / Alert / Dialog / Table / Form など全要素を確認',
          'Light / Dark の切り替えボタンで即座に比較',
          'デザインの雰囲気をつかむのに最適',
        ]}
      />

      {/* Step 6 */}
      <Step
        num={6}
        title='Export / Import する'
        description='Export ボタンで JSON ファイルとして保存、Import で既存の JSON を読み込めます。'
        tips={[
          'Export JSON: colors / names / palette / themeTokens を含む',
          '共有: Firebase ログイン後、Share Link で URL 共有が可能',
          'Figma 連携: Figma Variables API で直接読み書き',
        ]}
      />

      {/* Step 7 */}
      <Step
        num={7}
        title='Figma Variables と同期する (オプション)'
        description='「Figma」ボタンから Personal Access Token とファイル URL を入力すると、生成パレットを Figma Variable Collection として pushできます。'
        tips={[
          'Figma Enterprise / Organization プラン必要',
          'Personal Access Token は Figma Settings から発行',
          '既存の Variables を読み込むこともできる (Import)',
          'DTCG (Design Tokens Community Group) 形式で相互変換',
        ]}
      />

      {/* FAQ */}
      <Box sx={{ mt: 6 }}>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mb: 2 }}>
          よくある質問
        </Typography>
        <Faq
          q='Q. グレーを入力したのにティール色になるのはなぜ？'
          a='A. Material You は無彩色の入力にも hue を割り当てます。当ツールでは chroma < 4 の入力を検出して純粋グレースケールに強制変換しています。'
        />
        <Faq
          q='Q. main カラーが入力値と違う色になる'
          a='A. 修正済みです。main は常に入力 HEX をそのまま使用します。dark / light / lighter のみ TonalPalette から導出されます。'
        />
        <Faq
          q='Q. contrastText はどう決まる？'
          a='A. main の輝度 (luminance > 0.179) に基づいて pure white または pure black を選択します。WCAG のコントラスト基準に準拠。'
        />
        <Faq
          q='Q. カラーが保存されるのはどこ？'
          a='A. デフォルトでは localStorage。Firebase ログイン後はクラウド保存 + バージョン履歴 + 共有が可能。'
        />
        <Faq
          q='Q. 24色以上は追加できる？'
          a='A. 現在の制限は 24色です。パフォーマンス上の理由で設定されています。'
        />
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* フッター */}
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2 }}>
          さらに詳しい情報
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          <Button href='/' variant='contained' sx={{ textTransform: 'none', borderRadius: '8px' }}>
            Generator を開く
          </Button>
          <Button href='/example' variant='outlined' sx={{ textTransform: 'none', borderRadius: '8px' }}>
            Example を見る
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

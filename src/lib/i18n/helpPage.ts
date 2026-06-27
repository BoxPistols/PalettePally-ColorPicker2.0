// help ページのユーザー向け文言（ハードコード文字列の定数化）
export const helpPage = {
  headerTitle: '使い方ガイド',
  navGenerator: 'Generator',
  navExample: 'Example',
  intro:
    'Palette Pally は、MUI (Material-UI) 互換のカラーパレットを生成するツールです。 シードカラーを選ぶだけで、light / dark 両対応の5色パレット + グレースケール + ユーティリティトークンを自動生成できます。',

  // Step 1
  step1Title: 'カラーを選ぶ',
  step1Desc: '各カラーピッカーで HEX 値 / RGB / プリセットから色を選択します。カラー数は 1〜24 まで変更可能。',
  step1Tip1: '1番目の色が Primary (main theme color) として扱われます',
  step1Tip2: 'Primary から Grey / Utility Tokens が自動導出されます',
  step1Tip3: 'カラー名は任意で変更可能 (例: color1 → brand)',

  // Step 2
  step2Title: 'パレットが自動生成される',
  step2Desc: '各色に対して Material Design 3 ベースの 5段階パレット (main / dark / light / lighter / contrastText) が light / dark 両モードで生成されます。',
  step2Tip1: 'main はあなたが入力した HEX 値そのまま',
  step2Tip2: 'dark / light / lighter は TonalPalette から導出',
  step2Tip3: 'contrastText は輝度に応じて pure white / black (WCAG 準拠)',
  step2Tip4: '無彩色を入力すると純粋グレースケールに (ティール色にならない)',

  // Step 3
  step3Title: 'パレットを微調整する',
  step3Desc: '各カードの右上ペンアイコン をクリックすると編集 Dialog が開きます。個別の色をカラーピッカー / HEX で編集できます。',
  step3Tip1: 'Light / Dark のすべての shade を個別に編集可能',
  step3Tip2: 'Theme Tokens (Grey / text / background 等) も同様に編集',
  step3Tip3: '編集内容はリロード後も保持 (localStorage)',

  // Step 4
  step4Title: 'トークングループを追加する',
  step4Desc: 'Utility Tokens セクションの「+ Add Token Group」から独自のトークンカテゴリを追加できます。',
  step4Tip1: '例: icon (white / light / dark / action / disabled)',
  step4Tip2: '例: chart (category1 / category2 / category3)',
  step4Tip3: '例: status (online / offline / busy)',

  // Step 5
  step5Title: 'Example ページでプレビュー',
  step5Desc: 'ヘッダーの「Example」リンクから、生成したパレットを使った MUI コンポーネントのプレビューを確認できます。',
  step5Tip1: 'Button / Alert / Dialog / Table / Form など全要素を確認',
  step5Tip2: 'Light / Dark の切り替えボタンで即座に比較',
  step5Tip3: 'デザインの雰囲気をつかむのに最適',

  // Step 6
  step6Title: 'Export / Import する',
  step6Desc: 'Export ボタンで JSON ファイルとして保存、Import で既存の JSON を読み込めます。',
  step6Tip1: 'Export JSON: colors / names / palette / themeTokens を含む',
  step6Tip2: '共有: Firebase ログイン後、Share Link で URL 共有が可能',
  step6Tip3: 'Figma 連携: Figma Variables API で直接読み書き',

  // Step 7
  step7Title: 'Figma Variables と同期する (オプション)',
  step7Desc: '「Figma」ボタンから Personal Access Token とファイル URL を入力すると、生成パレットを Figma Variable Collection として pushできます。',
  step7Tip1: 'Figma Enterprise / Organization プラン必要',
  step7Tip2: 'Personal Access Token は Figma Settings から発行',
  step7Tip3: '既存の Variables を読み込むこともできる (Import)',
  step7Tip4: 'DTCG (Design Tokens Community Group) 形式で相互変換',

  // FAQ
  faqHeading: 'よくある質問',
  faq1Q: 'Q. グレーを入力したのにティール色になるのはなぜ？',
  faq1A: 'A. Material You は無彩色の入力にも hue を割り当てます。当ツールでは chroma < 4 の入力を検出して純粋グレースケールに強制変換しています。',
  faq2Q: 'Q. main カラーが入力値と違う色になる',
  faq2A: 'A. 修正済みです。main は常に入力 HEX をそのまま使用します。dark / light / lighter のみ TonalPalette から導出されます。',
  faq3Q: 'Q. contrastText はどう決まる？',
  faq3A: 'A. main の輝度 (luminance > 0.179) に基づいて pure white または pure black を選択します。WCAG のコントラスト基準に準拠。',
  faq4Q: 'Q. カラーが保存されるのはどこ？',
  faq4A: 'A. デフォルトでは localStorage。Firebase ログイン後はクラウド保存 + バージョン履歴 + 共有が可能。',
  faq5Q: 'Q. 24色以上は追加できる？',
  faq5A: 'A. 現在の制限は 24色です。パフォーマンス上の理由で設定されています。',

  // フッター
  footerMore: 'さらに詳しい情報',
  footerOpenGenerator: 'Generator を開く',
  footerSeeExample: 'Example を見る',
};

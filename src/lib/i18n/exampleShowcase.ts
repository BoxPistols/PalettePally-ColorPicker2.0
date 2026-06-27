// ExampleShowcase の UI 文字列（i18n 名前空間）
export const exampleShowcase = {
  // セクション見出し
  sectionTypography: 'Typography',
  sectionButtonsContained: 'Buttons (Contained)',
  sectionButtonsOutlined: 'Buttons (Outlined)',
  sectionButtonsText: 'Buttons (Text)',
  sectionChipsBadges: 'Chips & Badges',
  sectionAlerts: 'Alerts',
  sectionFormControls: 'Form Controls',
  sectionProgress: 'Progress',
  sectionTabs: 'Tabs',
  sectionTable: 'Table',
  sectionCard: 'Card',
  sectionList: 'List',
  sectionAccordion: 'Accordion',
  sectionBreadcrumbs: 'Breadcrumbs',
  sectionDialog: 'Dialog',
  sectionDividerTooltip: 'Divider & Tooltip',

  // Typography サンプル
  heading4: 'Heading 4',
  heading5: 'Heading 5',
  heading6: 'Heading 6',
  body1Text: 'Body 1 — the quick brown fox jumps over the lazy dog.',
  body2Text: 'Body 2 — secondary text color',
  captionText: 'Caption — disabled text',

  // 共通カラーラベル（Button / Chip / AlertTitle で再利用）
  primary: 'Primary',
  secondary: 'Secondary',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',
  error: 'Error',
  disabled: 'Disabled',
  default: 'Default',
  outlined: 'Outlined',

  // Alert 本文
  alertInfoBody: 'This is an informational message.',
  alertSuccessBody: 'Operation completed successfully.',
  alertWarningBody: 'Please review before proceeding.',
  alertErrorBody: 'Something went wrong.',

  // フォーム
  textInputLabel: 'Text Input',
  errorHelperText: 'This field has an error',
  selectLabel: 'Select',
  optionA: 'Option A',
  optionB: 'Option B',
  optionC: 'Option C',
  radioLabel: 'Radio',
  radioOptionA: 'A',
  radioOptionB: 'B',
  checkboxLabel: 'Checkbox',
  switchLabel: 'Switch',
  sliderLabel: (value: number) => `Slider: ${value}`,

  // タブ
  tabOverview: 'Overview',
  tabDetails: 'Details',
  tabActivity: 'Activity',
  tabSettings: 'Settings',
  tabContent: (index: number) => `Tab ${index} content`,

  // テーブル見出し
  tableName: 'Name',
  tableStatus: 'Status',
  tableAmount: 'Amount',

  // カード
  cardTitle: 'Card Title',
  cardDescription: 'Card description goes here. Supports multiline content.',
  cardActionLabel: 'Action',
  cancel: 'Cancel',
  outlinedCardTitle: 'Outlined Card',
  outlinedCardDescription: 'With outlined variant.',

  // アコーディオン
  accordionSection1: 'Section 1',
  accordionSection2: 'Section 2',
  accordionContent1: 'Expandable content for section 1.',
  accordionContent2: 'Expandable content for section 2.',

  // パンくず
  breadcrumbHome: 'Home',
  breadcrumbCatalog: 'Catalog',
  breadcrumbCurrent: 'Current',

  // ダイアログ
  openDialog: 'Open Dialog',
  dialogTitle: 'Dialog Title',
  dialogContent: 'This dialog uses the generated theme colors.',
  confirm: 'Confirm',

  // ツールチップ / ディバイダ
  tooltipText: 'Tooltip text here',
  hoverMe: 'Hover me',
  dividerOr: 'OR',
};

// ExampleDialog の UI 文字列（i18n 名前空間）
export const exampleDialog = {
  title: 'Theme Preview',
  // パレット名とシードカラーを区切って表示
  subtitle: (name: string, color: string) => `${name} — ${color}`,
  lightLabel: 'Light',
  darkLabel: 'Dark',
};

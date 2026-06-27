// shared/[shareId] ページのユーザー向け文言（ハードコード文字列の定数化）
export const sharedPage = {
  errorNotFoundOrExpired: 'Palette not found or link expired',
  errorLoadFailed: 'Failed to load palette',
  errorDuplicateFailed: 'Failed to duplicate',
  notFound: 'Not found',
  backToGenerator: 'Back to Generator',
  duplicateToMyAccount: 'Duplicate to My Account',
  generator: 'Generator',

  // 複製時に新規保存されるパレットの名前・説明（補間あり）
  duplicateName: (name: string) => `${name} (copy)`,
  duplicateDescription: (name: string) => `Duplicated from "${name}"`,
};

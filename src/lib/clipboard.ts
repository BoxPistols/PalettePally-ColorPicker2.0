// クリップボードコピーの共通ユーティリティ。
// クリップボード API 不可環境（非セキュアコンテキスト / 権限なし）でも例外を投げず、
// 成否を boolean で返す。複数コンポーネントで重複定義していたものを一本化。
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

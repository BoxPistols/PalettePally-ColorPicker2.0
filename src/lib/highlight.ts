// 依存ゼロの軽量シンタックスハイライタ。Export プレビュー (JSON / CSS / SCSS / TS / JS / MD)
// を対象に、コメント・文字列・数値・キーワード・記号を分類する。
// カラーツールなので 16 進カラー (引用符あり/なし) を専用トークンに分離し、
// 呼び出し側でスウォッチ表示できるようにする。bundle 予算が厳しいため外部ライブラリは使わない。

export type TokenType =
  | 'comment'
  | 'hex'
  | 'string'
  | 'number'
  | 'keyword'
  | 'punct'
  | 'text';

export interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set([
  'true',
  'false',
  'null',
  'const',
  'let',
  'var',
  'export',
  'import',
  'from',
  'module',
  'exports',
  'type',
  'return',
  'default',
]);

// 優先順位順の単一マスター正規表現。
// 引用符つき hex を生 string より前に置き、hex として捕捉する。
const MATCH_RE =
  /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"#[0-9a-fA-F]{3,8}"|'#[0-9a-fA-F]{3,8}'|#[0-9a-fA-F]{3,8}\b|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b(?:true|false|null|const|let|var|export|import|from|module|exports|type|return|default)\b|[{}[\]():,;=]/g;

function classify(v: string): TokenType {
  if (v.startsWith('/*') || v.startsWith('//')) return 'comment';
  if (/#/.test(v) && /^['"]?#[0-9a-fA-F]{3,8}['"]?$/.test(v)) return 'hex';
  if (v.startsWith('"') || v.startsWith("'")) return 'string';
  if (/^\d/.test(v)) return 'number';
  if (KEYWORDS.has(v)) return 'keyword';
  return 'punct';
}

// コードをトークン列に分解する（マッチ間の隙間は 'text' として保持）。
export function tokenizeCode(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  MATCH_RE.lastIndex = 0;
  while ((m = MATCH_RE.exec(code)) !== null) {
    if (m.index > last) {
      tokens.push({ type: 'text', value: code.slice(last, m.index) });
    }
    tokens.push({ type: classify(m[0]), value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < code.length) {
    tokens.push({ type: 'text', value: code.slice(last) });
  }
  return tokens;
}

// hex トークンの値から引用符を除いた純粋な CSS カラーを取り出す（スウォッチ用）。
export function hexFromToken(value: string): string {
  return value.replace(/['"]/g, '');
}

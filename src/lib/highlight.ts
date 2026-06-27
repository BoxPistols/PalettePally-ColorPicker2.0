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
// hex は有効な CSS 長（#RGB / #RGBA / #RRGGBB / #RRGGBBAA = 3/4/6/8 桁）のみ。
// {3,8} だと 5/7 桁の無効カラーまで拾い、無効なスウォッチを描いてしまうため除外する。
const HEX_BODY = '(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})';
const MATCH_RE = new RegExp(
  [
    String.raw`/\*[\s\S]*?\*/`,
    String.raw`//[^\n]*`,
    `"#${HEX_BODY}"`,
    `'#${HEX_BODY}'`,
    `#${HEX_BODY}\\b`,
    String.raw`"(?:\\.|[^"\\])*"`,
    String.raw`'(?:\\.|[^'\\])*'`,
    String.raw`\b\d+(?:\.\d+)?\b`,
    String.raw`\b(?:true|false|null|const|let|var|export|import|from|module|exports|type|return|default)\b`,
    String.raw`[{}[\]():,;=]`,
  ].join('|'),
  'g'
);
const HEX_TOKEN_RE = new RegExp(`^['"]?#${HEX_BODY}['"]?$`);

function classify(v: string): TokenType {
  if (v.startsWith('/*') || v.startsWith('//')) return 'comment';
  if (v.includes('#') && HEX_TOKEN_RE.test(v)) return 'hex';
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

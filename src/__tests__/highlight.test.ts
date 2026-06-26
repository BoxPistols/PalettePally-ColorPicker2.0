import { tokenizeCode, hexFromToken, Token } from '@/lib/highlight';

const typesOf = (tokens: Token[], type: string) =>
  tokens.filter(t => t.type === type).map(t => t.value);

describe('tokenizeCode', () => {
  it('round-trips: concatenated token values equal the input', () => {
    const code = `:root {\n  --color-primary-main: #1976d2;\n}\n`;
    const tokens = tokenizeCode(code);
    expect(tokens.map(t => t.value).join('')).toBe(code);
  });

  it('classifies an unquoted CSS hex as a hex token', () => {
    const tokens = tokenizeCode('color: #1976d2;');
    expect(typesOf(tokens, 'hex')).toContain('#1976d2');
  });

  it('classifies a quoted hex (JSON/Tailwind) as a hex token, keeping quotes', () => {
    const tokens = tokenizeCode('"DEFAULT": "#1976d2",');
    expect(typesOf(tokens, 'hex')).toContain('"#1976d2"');
    // the property name string is still a string, not a hex
    expect(typesOf(tokens, 'string')).toContain('"DEFAULT"');
  });

  it('classifies a single-quoted hex (MUI TS output) as hex', () => {
    const tokens = tokenizeCode("main: '#1976d2',");
    expect(typesOf(tokens, 'hex')).toContain("'#1976d2'");
  });

  it('supports 3- and 8-digit hex', () => {
    const tokens = tokenizeCode('a: #abc; b: #1976d2ff;');
    const hexes = typesOf(tokens, 'hex');
    expect(hexes).toContain('#abc');
    expect(hexes).toContain('#1976d2ff');
  });

  it('does not treat a Markdown heading "# Title" as a hex', () => {
    const tokens = tokenizeCode('# Palette Pally\n');
    expect(typesOf(tokens, 'hex')).toHaveLength(0);
  });

  it('recognizes line and block comments', () => {
    const tokens = tokenizeCode('// note\n/* block */\n');
    expect(typesOf(tokens, 'comment')).toEqual(['// note', '/* block */']);
  });

  it('recognizes numbers inside rgba()', () => {
    const tokens = tokenizeCode('hover: rgba(0, 0, 0, 0.08)');
    expect(typesOf(tokens, 'number')).toEqual(['0', '0', '0', '0.08']);
  });

  it('recognizes keywords but not keyword-like text inside strings', () => {
    const tokens = tokenizeCode('export const x = "DEFAULT"');
    expect(typesOf(tokens, 'keyword')).toEqual(expect.arrayContaining(['export', 'const']));
    expect(typesOf(tokens, 'string')).toContain('"DEFAULT"');
  });

  it('handles empty input', () => {
    expect(tokenizeCode('')).toEqual([]);
  });
});

describe('hexFromToken', () => {
  it('strips surrounding quotes', () => {
    expect(hexFromToken('"#1976d2"')).toBe('#1976d2');
    expect(hexFromToken("'#abc'")).toBe('#abc');
    expect(hexFromToken('#004786')).toBe('#004786');
  });
});

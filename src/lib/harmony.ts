import chroma from 'chroma-js';

export type HarmonyScheme =
  | 'complementary'   // 補色 (180°)
  | 'analogous'       // 類似色 (±30°)
  | 'triadic'         // 三色配色 (120°)
  | 'tetradic'        // 四色配色 (90°)
  | 'splitComplement' // スプリット補色 (180±30°)
  | 'monochrome';     // モノクロ (明度バリエーション)

export const HARMONY_LABELS: Record<HarmonyScheme, string> = {
  complementary: 'Complementary',
  analogous: 'Analogous',
  triadic: 'Triadic',
  tetradic: 'Tetradic',
  splitComplement: 'Split Complement',
  monochrome: 'Monochrome',
};

// 無彩色入力のフォールバック値
const FALLBACK_SATURATION = 0.7;
const FALLBACK_LIGHTNESS = 0.5;
// Monochrome の明度 clamp
const MONOCHROME_LIGHTNESS_DELTA = 0.3;
const MONOCHROME_MIN_LIGHTNESS = 0.15;
const MONOCHROME_MAX_LIGHTNESS = 0.85;

// base の色相から harmony scheme に基づく色を生成
export function generateHarmony(baseHex: string, scheme: HarmonyScheme, count: number): string[] {
  const base = chroma(baseHex);
  const [h, s, l] = base.hsl();
  const hue = h || 0;
  const sat = s || FALLBACK_SATURATION;
  const light = l || FALLBACK_LIGHTNESS;
  const result: string[] = [baseHex];

  const rotate = (offset: number) => chroma.hsl((hue + offset + 360) % 360, sat, light).hex();

  switch (scheme) {
    case 'complementary':
      result.push(rotate(180));
      break;
    case 'analogous':
      result.push(rotate(30), rotate(-30));
      break;
    case 'triadic':
      result.push(rotate(120), rotate(240));
      break;
    case 'tetradic':
      result.push(rotate(90), rotate(180), rotate(270));
      break;
    case 'splitComplement':
      result.push(rotate(150), rotate(210));
      break;
    case 'monochrome': {
      // 明度を変化させた monochrome
      result.push(
        chroma.hsl(hue, sat, Math.max(MONOCHROME_MIN_LIGHTNESS, light - MONOCHROME_LIGHTNESS_DELTA)).hex(),
        chroma.hsl(hue, sat, Math.min(MONOCHROME_MAX_LIGHTNESS, light + MONOCHROME_LIGHTNESS_DELTA)).hex(),
      );
      break;
    }
  }

  // count に満たない分は更に色相をずらして補完
  while (result.length < count) {
    const offset = (result.length * 360) / count;
    result.push(rotate(offset));
  }
  return result.slice(0, count);
}

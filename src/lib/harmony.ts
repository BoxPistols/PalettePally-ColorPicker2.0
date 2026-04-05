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

// base の色相から harmony scheme に基づく色を生成
export function generateHarmony(baseHex: string, scheme: HarmonyScheme, count: number): string[] {
  const base = chroma(baseHex);
  const [h, s, l] = base.hsl();
  const hue = h || 0;
  const result: string[] = [baseHex];

  const rotate = (offset: number) => chroma.hsl((hue + offset + 360) % 360, s || 0.7, l || 0.5).hex();

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
      const baseLightness = l || 0.5;
      result.push(
        chroma.hsl(hue, s || 0.7, Math.max(0.15, baseLightness - 0.3)).hex(),
        chroma.hsl(hue, s || 0.7, Math.min(0.85, baseLightness + 0.3)).hex(),
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

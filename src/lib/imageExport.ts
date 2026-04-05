import { PaletteData } from '@/lib/types/palette';

// Canvas でパレットを PNG 画像として描画
export async function paletteToPNG(
  data: PaletteData,
  opts: { mode?: 'light' | 'dark'; width?: number; cellHeight?: number } = {}
): Promise<Blob | null> {
  const mode = opts.mode ?? 'light';
  const width = opts.width ?? 1200;
  const cellHeight = opts.cellHeight ?? 80;

  const palette = data.palette ?? [];
  if (palette.length === 0) return null;

  // Layout: 各 color につき 5 shades を横一列 + color name ラベル
  const shadeKeys = ['main', 'dark', 'light', 'lighter', 'contrastText'] as const;
  const nameColumnWidth = 140;
  const cellWidth = (width - nameColumnWidth) / shadeKeys.length;
  const height = cellHeight * palette.length + 60; // +60 for header

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 背景
  ctx.fillStyle = mode === 'light' ? '#ffffff' : '#18181b';
  ctx.fillRect(0, 0, width, height);

  // ヘッダー
  ctx.fillStyle = mode === 'light' ? '#1a1a2e' : '#e4e4e7';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('Palette Pally', 20, 30);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = mode === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  ctx.fillText(`${palette.length} colors · ${mode} mode`, 20, 50);

  // Shade ラベル (横軸)
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
  shadeKeys.forEach((shade, i) => {
    const x = nameColumnWidth + i * cellWidth + cellWidth / 2;
    ctx.textAlign = 'center';
    ctx.fillText(shade, x, 50);
  });
  ctx.textAlign = 'left';

  // 各 color の行
  palette.forEach((entry, row) => {
    const [name, colors] = Object.entries(entry)[0] ?? [];
    if (!name || !colors) return;
    const variant = colors[mode];
    const y = 60 + row * cellHeight;

    // Color name
    ctx.fillStyle = mode === 'light' ? '#1a1a2e' : '#e4e4e7';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(name, 20, y + cellHeight / 2 + 5);

    // Shades
    shadeKeys.forEach((shade, i) => {
      const color = variant[shade];
      const x = nameColumnWidth + i * cellWidth;
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, y + 4, cellWidth - 4, cellHeight - 8);

      // Hex label overlay
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      ctx.fillStyle = luminance > 0.5 ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(color, x + 10, y + cellHeight - 12);
    });
  });

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png');
  });
}

// PNG ダウンロード (ブラウザ経由)
export async function downloadPalettePNG(
  data: PaletteData,
  opts: { mode?: 'light' | 'dark'; filename?: string } = {}
): Promise<void> {
  const blob = await paletteToPNG(data, opts);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = opts.filename ?? `palette-${opts.mode ?? 'light'}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

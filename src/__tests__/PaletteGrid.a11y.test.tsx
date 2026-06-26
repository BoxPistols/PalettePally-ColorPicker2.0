/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaletteCard } from '@/components/PaletteGrid';
import { ColorPalette } from '@/components/colorUtils';

const writeText = jest.fn();
Object.assign(navigator, { clipboard: { writeText } });

const sample: ColorPalette = {
  light: { main: '#1976d2', dark: '#115293', light: '#42a5f5', lighter: '#e3f2fd', contrastText: '#ffffff' },
  dark: { main: '#90caf9', dark: '#64b5f6', light: '#bbdefb', lighter: '#1e3a5f', contrastText: '#000000' },
};

describe('PaletteCard color swatch accessibility', () => {
  beforeEach(() => writeText.mockClear());

  it('exposes swatches as keyboard-focusable buttons with a label', () => {
    render(<PaletteCard colorPalette={sample} colorName='primary' />);
    const swatch = screen.getByLabelText(/main #1976d2 をコピー/);
    expect(swatch).toHaveAttribute('role', 'button');
    expect(swatch).toHaveAttribute('tabindex', '0');
  });

  it('copies the color value on Enter key (keyboard operable, WCAG 2.1.1)', () => {
    render(<PaletteCard colorPalette={sample} colorName='primary' />);
    const swatch = screen.getByLabelText(/main #1976d2 をコピー/);
    fireEvent.keyDown(swatch, { key: 'Enter' });
    expect(writeText).toHaveBeenCalledWith('#1976d2');
  });

  it('copies the color value on Space key', () => {
    render(<PaletteCard colorPalette={sample} colorName='primary' />);
    const swatch = screen.getByLabelText(/light #42a5f5 をコピー/);
    fireEvent.keyDown(swatch, { key: ' ' });
    expect(writeText).toHaveBeenCalledWith('#42a5f5');
  });
});

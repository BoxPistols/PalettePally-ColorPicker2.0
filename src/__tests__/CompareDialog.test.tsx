/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompareDialog } from '@/components/compare/CompareDialog';
import { PaletteData } from '@/lib/types/palette';

const sampleCurrent: PaletteData = {
  numColors: 2,
  colors: ['#1976d2', '#9c27b0'],
  names: ['primary', 'secondary'],
  palette: [],
  themeTokens: null,
};

describe('CompareDialog', () => {
  it('renders title and instructions', () => {
    render(<CompareDialog open={true} onClose={() => {}} current={sampleCurrent} />);
    expect(screen.getByText('Compare Palettes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste Palette Pally JSON/)).toBeInTheDocument();
  });

  it('shows error for invalid JSON', () => {
    render(<CompareDialog open={true} onClose={() => {}} current={sampleCurrent} />);
    const textarea = screen.getByPlaceholderText(/Paste Palette Pally JSON/);
    fireEvent.change(textarea, { target: { value: 'not json' } });
    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
  });

  it('shows error for JSON without colors array', () => {
    render(<CompareDialog open={true} onClose={() => {}} current={sampleCurrent} />);
    const textarea = screen.getByPlaceholderText(/Paste Palette Pally JSON/);
    fireEvent.change(textarea, { target: { value: '{"foo": "bar"}' } });
    expect(screen.getByText('Not a valid Palette Pally JSON')).toBeInTheDocument();
  });

  it('displays comparison when valid JSON pasted', () => {
    render(<CompareDialog open={true} onClose={() => {}} current={sampleCurrent} />);
    const textarea = screen.getByPlaceholderText(/Paste Palette Pally JSON/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          colors: ['#ff0000', '#00ff00'],
          names: ['red', 'green'],
          palette: [],
        }),
      },
    });
    expect(screen.getByText(/Current \(2 colors\)/)).toBeInTheDocument();
    expect(screen.getByText(/Imported \(2 colors\)/)).toBeInTheDocument();
  });

  it('handles identical palettes (no diff)', () => {
    render(<CompareDialog open={true} onClose={() => {}} current={sampleCurrent} />);
    const textarea = screen.getByPlaceholderText(/Paste Palette Pally JSON/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          colors: sampleCurrent.colors,
          names: sampleCurrent.names,
          palette: [],
        }),
      },
    });
    // '=' indicators should appear for identical colors
    expect(screen.getAllByText('=').length).toBeGreaterThan(0);
  });

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn();
    render(<CompareDialog open={true} onClose={onClose} current={sampleCurrent} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });
});

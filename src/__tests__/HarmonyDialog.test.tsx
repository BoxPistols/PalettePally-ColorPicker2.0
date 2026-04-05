/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HarmonyDialog } from '@/components/harmony/HarmonyDialog';

describe('HarmonyDialog', () => {
  const defaultProps = {
    open: true,
    onClose: () => {},
    baseColor: '#1976d2',
    count: 3,
    onApply: () => {},
  };

  it('renders title and base color input', () => {
    render(<HarmonyDialog {...defaultProps} />);
    expect(screen.getByText('Generate Harmony')).toBeInTheDocument();
    expect(screen.getByText('Base color')).toBeInTheDocument();
  });

  it('renders all 6 scheme buttons', () => {
    render(<HarmonyDialog {...defaultProps} />);
    expect(screen.getByText('Complementary')).toBeInTheDocument();
    expect(screen.getByText('Analogous')).toBeInTheDocument();
    expect(screen.getByText('Triadic')).toBeInTheDocument();
    expect(screen.getByText('Tetradic')).toBeInTheDocument();
    expect(screen.getByText('Split Complement')).toBeInTheDocument();
    expect(screen.getByText('Monochrome')).toBeInTheDocument();
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = jest.fn();
    render(<HarmonyDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onApply with generated colors', () => {
    const onApply = jest.fn();
    render(<HarmonyDialog {...defaultProps} onApply={onApply} />);
    fireEvent.click(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalled();
    const calledWith = onApply.mock.calls[0][0];
    expect(Array.isArray(calledWith)).toBe(true);
    expect(calledWith.length).toBe(3);
  });

  it('switches scheme when button clicked', () => {
    render(<HarmonyDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Complementary'));
    // Complementary should be active (contained variant)
    const btn = screen.getByText('Complementary').closest('button');
    expect(btn).toHaveClass('MuiButton-contained');
  });

  it('does not render when open=false', () => {
    render(<HarmonyDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Generate Harmony')).not.toBeInTheDocument();
  });

  it('shows preview for selected count', () => {
    render(<HarmonyDialog {...defaultProps} count={5} />);
    fireEvent.click(screen.getByText('Apply'));
    // Applied with triadic default padded to 5
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('starts with provided baseColor', () => {
    render(<HarmonyDialog {...defaultProps} baseColor='#ff0000' />);
    // Color input + text input both have the same value
    const inputs = screen.getAllByDisplayValue('#ff0000');
    expect(inputs.length).toBeGreaterThan(0);
  });
});

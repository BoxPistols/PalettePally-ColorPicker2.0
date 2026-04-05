/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FigmaConnectDialog } from '@/components/figma/FigmaConnectDialog';

describe('FigmaConnectDialog', () => {
  const defaultProps = {
    open: true,
    onClose: () => {},
    onConnect: () => {},
  };

  it('renders title and input fields', () => {
    render(<FigmaConnectDialog {...defaultProps} />);
    expect(screen.getByText('Connect to Figma')).toBeInTheDocument();
    expect(screen.getByText('Personal Access Token')).toBeInTheDocument();
    expect(screen.getByText('Figma File URL or Key')).toBeInTheDocument();
  });

  it('Connect button disabled when fields empty', () => {
    render(<FigmaConnectDialog {...defaultProps} />);
    const btn = screen.getByText('Connect').closest('button');
    expect(btn).toBeDisabled();
  });

  it('pre-fills with savedPat and savedFileKey', () => {
    render(
      <FigmaConnectDialog
        {...defaultProps}
        savedPat='figd_existing'
        savedFileKey='abc123'
      />
    );
    expect(screen.getByDisplayValue('figd_existing')).toBeInTheDocument();
    expect(screen.getByDisplayValue('abc123')).toBeInTheDocument();
  });

  it('extracts fileKey from Figma URL', () => {
    const onConnect = jest.fn();
    render(<FigmaConnectDialog {...defaultProps} onConnect={onConnect} />);
    const patInput = screen.getByPlaceholderText(/figd_/);
    const urlInput = screen.getByPlaceholderText(/figma\.com\/design/);
    fireEvent.change(patInput, { target: { value: 'figd_token' } });
    fireEvent.change(urlInput, {
      target: { value: 'https://www.figma.com/design/ABC123XYZ/MyFile' },
    });
    fireEvent.click(screen.getByText('Connect'));
    expect(onConnect).toHaveBeenCalledWith('figd_token', 'ABC123XYZ');
  });

  it('accepts raw file key', () => {
    const onConnect = jest.fn();
    render(<FigmaConnectDialog {...defaultProps} onConnect={onConnect} />);
    const patInput = screen.getByPlaceholderText(/figd_/);
    const urlInput = screen.getByPlaceholderText(/figma\.com\/design/);
    fireEvent.change(patInput, { target: { value: 'figd_token' } });
    fireEvent.change(urlInput, { target: { value: 'ABC123XYZ' } });
    fireEvent.click(screen.getByText('Connect'));
    expect(onConnect).toHaveBeenCalledWith('figd_token', 'ABC123XYZ');
  });

  it('shows error for invalid URL', () => {
    const onConnect = jest.fn();
    render(<FigmaConnectDialog {...defaultProps} onConnect={onConnect} />);
    const patInput = screen.getByPlaceholderText(/figd_/);
    const urlInput = screen.getByPlaceholderText(/figma\.com\/design/);
    fireEvent.change(patInput, { target: { value: 'figd_token' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com/not-figma' } });
    fireEvent.click(screen.getByText('Connect'));
    expect(screen.getByText('Invalid Figma file URL or key')).toBeInTheDocument();
    expect(onConnect).not.toHaveBeenCalled();
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = jest.fn();
    render(<FigmaConnectDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});

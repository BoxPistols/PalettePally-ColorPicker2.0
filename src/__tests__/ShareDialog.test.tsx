/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// Mock firebase before importing ShareDialog
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(), getApps: () => [], getApp: jest.fn() }));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(() => () => undefined),
}));
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn() }));

const mockGenerateShareLink = jest.fn();
const mockRevokeShareLink = jest.fn();

jest.mock('@/lib/firebase/firestore', () => ({
  generateShareLink: (...args: unknown[]) => mockGenerateShareLink(...args),
  revokeShareLink: (...args: unknown[]) => mockRevokeShareLink(...args),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareDialog } from '@/components/palette/ShareDialog';

// Mock clipboard
Object.assign(navigator, {
  clipboard: { writeText: jest.fn() },
});

describe('ShareDialog', () => {
  const defaultProps = {
    open: true,
    onClose: () => {},
    paletteId: 'palette-123',
    paletteName: 'My Palette',
    currentShareId: null,
    onRevoke: async () => true,
  };

  beforeEach(() => {
    mockGenerateShareLink.mockReset();
    mockRevokeShareLink.mockReset();
  });

  it('renders title with palette name', () => {
    render(<ShareDialog {...defaultProps} />);
    expect(screen.getByText(/My Palette/)).toBeInTheDocument();
  });

  it('shows Generate button when no share link exists', () => {
    render(<ShareDialog {...defaultProps} />);
    expect(screen.getByText('Generate Share Link')).toBeInTheDocument();
  });

  it('shows permission toggle buttons', () => {
    render(<ShareDialog {...defaultProps} />);
    expect(screen.getByText('View only')).toBeInTheDocument();
    expect(screen.getByText('View + Duplicate')).toBeInTheDocument();
  });

  it('calls generateShareLink with view permission', async () => {
    mockGenerateShareLink.mockResolvedValue('abc123xyz');
    render(<ShareDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Generate Share Link'));
    await waitFor(() => {
      expect(mockGenerateShareLink).toHaveBeenCalledWith('palette-123', 'view');
    });
  });

  it('switches to duplicate permission', async () => {
    mockGenerateShareLink.mockResolvedValue('abc123xyz');
    render(<ShareDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('View + Duplicate'));
    fireEvent.click(screen.getByText('Generate Share Link'));
    await waitFor(() => {
      expect(mockGenerateShareLink).toHaveBeenCalledWith('palette-123', 'duplicate');
    });
  });

  it('shows URL input when share link exists', () => {
    render(<ShareDialog {...defaultProps} currentShareId='abc123xyz' />);
    expect(screen.getByText('Share link:')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Revoke Link')).toBeInTheDocument();
  });

  it('copies URL to clipboard', () => {
    render(<ShareDialog {...defaultProps} currentShareId='abc123xyz' />);
    fireEvent.click(screen.getByText('Copy'));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('calls onRevoke + revokeShareLink when Revoke clicked', async () => {
    const onRevoke = jest.fn(async () => true);
    mockRevokeShareLink.mockResolvedValue(undefined);
    render(
      <ShareDialog
        {...defaultProps}
        currentShareId='abc123xyz'
        onRevoke={onRevoke}
      />
    );
    fireEvent.click(screen.getByText('Revoke Link'));
    await waitFor(() => expect(onRevoke).toHaveBeenCalled());
    await waitFor(() => expect(mockRevokeShareLink).toHaveBeenCalledWith('palette-123'));
  });

  it('calls onClose when Close clicked', () => {
    const onClose = jest.fn();
    render(<ShareDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});

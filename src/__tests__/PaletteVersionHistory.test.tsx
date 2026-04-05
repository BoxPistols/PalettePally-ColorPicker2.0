/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

jest.mock('firebase/app', () => ({ initializeApp: jest.fn(), getApps: () => [], getApp: jest.fn() }));
jest.mock('firebase/auth', () => ({ getAuth: jest.fn(), onAuthStateChanged: jest.fn(() => () => undefined) }));
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn() }));

const mockGetVersionHistory = jest.fn();
jest.mock('@/lib/firebase/firestore', () => ({
  getVersionHistory: (...args: unknown[]) => mockGetVersionHistory(...args),
}));

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PaletteVersionHistory } from '@/components/palette/PaletteVersionHistory';

describe('PaletteVersionHistory', () => {
  const defaultProps = {
    open: true,
    onClose: () => {},
    paletteId: 'p-1',
    paletteName: 'Test',
    onRestore: async () => true,
  };

  beforeEach(() => {
    mockGetVersionHistory.mockReset();
  });

  it('renders title and palette name', async () => {
    mockGetVersionHistory.mockResolvedValue([]);
    render(<PaletteVersionHistory {...defaultProps} />);
    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('shows "No versions" when list is empty', async () => {
    mockGetVersionHistory.mockResolvedValue([]);
    render(<PaletteVersionHistory {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('No versions')).toBeInTheDocument());
  });

  it('renders version list with current chip', async () => {
    mockGetVersionHistory.mockResolvedValue([
      { id: 'v3', version: 3, label: 'v3', createdAt: new Date(), changeNote: 'Latest', data: {} },
      { id: 'v2', version: 2, label: 'v2', createdAt: new Date(), changeNote: '', data: {} },
      { id: 'v1', version: 1, label: 'v1', createdAt: new Date(), changeNote: 'Initial', data: {} },
    ]);
    render(<PaletteVersionHistory {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('v3')).toBeInTheDocument());
    expect(screen.getByText('v2')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText('current')).toBeInTheDocument();
  });

  it('shows Restore label for older versions', async () => {
    mockGetVersionHistory.mockResolvedValue([
      { id: 'v2', version: 2, label: 'v2', createdAt: new Date(), changeNote: '', data: {} },
      { id: 'v1', version: 1, label: 'v1', createdAt: new Date(), changeNote: '', data: {} },
    ]);
    render(<PaletteVersionHistory {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('Restore')).toBeInTheDocument());
  });

  it('calls onRestore when older version clicked', async () => {
    const onRestore = jest.fn(async () => true);
    mockGetVersionHistory.mockResolvedValue([
      { id: 'v2', version: 2, label: 'v2', createdAt: new Date(), changeNote: '', data: {} },
      { id: 'v1', version: 1, label: 'v1', createdAt: new Date(), changeNote: '', data: {} },
    ]);
    render(<PaletteVersionHistory {...defaultProps} onRestore={onRestore} />);
    await waitFor(() => expect(screen.getByText('v1')).toBeInTheDocument());
    fireEvent.click(screen.getByText('v1'));
    await waitFor(() => expect(onRestore).toHaveBeenCalledWith('v1', 1));
  });
});

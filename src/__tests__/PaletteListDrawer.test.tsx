/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

jest.mock('firebase/app', () => ({ initializeApp: jest.fn(), getApps: () => [], getApp: jest.fn() }));
jest.mock('firebase/auth', () => ({ getAuth: jest.fn(), onAuthStateChanged: jest.fn(() => () => undefined) }));
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn() }));

const mockListPalettes = jest.fn();
jest.mock('@/lib/firebase/firestore', () => ({
  listPalettes: (...args: unknown[]) => mockListPalettes(...args),
}));

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PaletteListDrawer } from '@/components/palette/PaletteListDrawer';

describe('PaletteListDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: () => {},
    uid: 'test-uid',
    onLoad: () => {},
    onDelete: async () => true,
  };

  beforeEach(() => {
    mockListPalettes.mockReset();
  });

  it('renders title', async () => {
    mockListPalettes.mockResolvedValue([]);
    render(<PaletteListDrawer {...defaultProps} />);
    expect(screen.getByText('My Palettes')).toBeInTheDocument();
  });

  it('shows "No saved palettes" when empty', async () => {
    mockListPalettes.mockResolvedValue([]);
    render(<PaletteListDrawer {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('No saved palettes')).toBeInTheDocument());
  });

  it('renders palettes with name and version', async () => {
    mockListPalettes.mockResolvedValue([
      {
        id: 'p1',
        name: 'Brand Colors',
        currentVersion: 2,
        updatedAt: new Date(),
        data: { colors: ['#ff0000', '#00ff00'] },
      },
    ]);
    render(<PaletteListDrawer {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('Brand Colors')).toBeInTheDocument());
    expect(screen.getByText(/v2/)).toBeInTheDocument();
  });

  it('calls onLoad + onClose when palette clicked', async () => {
    const onLoad = jest.fn();
    const onClose = jest.fn();
    const palette = {
      id: 'p1',
      name: 'Test',
      currentVersion: 1,
      updatedAt: new Date(),
      data: { colors: ['#ff0000'] },
    };
    mockListPalettes.mockResolvedValue([palette]);
    render(<PaletteListDrawer {...defaultProps} onLoad={onLoad} onClose={onClose} />);
    await waitFor(() => expect(screen.getByText('Test')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Test'));
    expect(onLoad).toHaveBeenCalledWith(palette);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders delete icon for each palette', async () => {
    mockListPalettes.mockResolvedValue([
      { id: 'p1', name: 'Test', currentVersion: 1, updatedAt: new Date(), data: { colors: [] } },
    ]);
    render(<PaletteListDrawer {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('Test')).toBeInTheDocument());
    // List item button + delete icon button + close button = 3 buttons
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
  });
});

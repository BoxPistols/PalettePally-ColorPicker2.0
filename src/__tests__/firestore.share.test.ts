// shares/{shareId} スナップショット方式の共有ロジックを、firebase/firestore SDK を
// モックして検証する（エミュレータ無しでオーケストレーションの正しさを担保）。

const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockGetDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_db: unknown, name: string) => ({ collection: name })),
  doc: jest.fn((_db: unknown, col: string, id: string) => ({ col, id })),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: () => 'TS',
  writeBatch: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({ db: {} }));
jest.mock('nanoid', () => ({ nanoid: () => 'SHAREID12345' }));

import {
  generateShareLink,
  revokeShareLink,
  loadSharedPalette,
} from '@/lib/firebase/firestore';

beforeEach(() => {
  mockSetDoc.mockReset();
  mockUpdateDoc.mockReset();
  mockDeleteDoc.mockReset();
  mockGetDoc.mockReset();
});

describe('generateShareLink', () => {
  it('writes an immutable snapshot to shares/{shareId} and flags the palette', async () => {
    // loadPalette() の getDoc
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'p1',
      data: () => ({ ownerUid: 'u1', name: 'My Palette', description: 'd', data: { colors: ['#fff'] } }),
    });

    const id = await generateShareLink('p1', 'view');
    expect(id).toBe('SHAREID12345');

    // shares コレクションにスナップショットを保存
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [ref, payload] = mockSetDoc.mock.calls[0];
    expect(ref).toEqual({ col: 'shares', id: 'SHAREID12345' });
    expect(payload).toMatchObject({
      paletteId: 'p1',
      ownerUid: 'u1',
      permission: 'view',
      name: 'My Palette',
    });
    expect(payload.data).toEqual({ colors: ['#fff'] });

    // palette 側に shareId/sharePermission を記録
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      { col: 'palettes', id: 'p1' },
      { shareId: 'SHAREID12345', sharePermission: 'view' }
    );
  });

  it('deletes a pre-existing share doc before creating a new one (no orphan links)', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'p1',
      data: () => ({ ownerUid: 'u1', name: 'My', description: 'd', data: {}, shareId: 'OLDSHARE12345' }),
    });
    await generateShareLink('p1', 'view');
    // 旧 share doc を削除してから新規作成する
    expect(mockDeleteDoc).toHaveBeenCalledWith({ col: 'shares', id: 'OLDSHARE12345' });
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
  });

  it('does not delete anything when the palette has no existing share', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'p1',
      data: () => ({ ownerUid: 'u1', name: 'My', description: 'd', data: {} }),
    });
    await generateShareLink('p1', 'view');
    expect(mockDeleteDoc).not.toHaveBeenCalled();
  });
});

describe('loadSharedPalette', () => {
  it('returns a palette-shaped object from the share snapshot', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        paletteId: 'p1',
        ownerUid: 'u1',
        permission: 'duplicate',
        name: 'My',
        description: 'd',
        data: { colors: [] },
      }),
    });

    const res = await loadSharedPalette('SHAREID12345');
    expect(mockGetDoc).toHaveBeenCalledWith({ col: 'shares', id: 'SHAREID12345' });
    expect(res).toMatchObject({ id: 'p1', name: 'My', sharePermission: 'duplicate' });
  });

  it('returns null when the share does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false });
    expect(await loadSharedPalette('missing')).toBeNull();
  });
});

describe('revokeShareLink', () => {
  it('deletes the share doc and clears the palette flags', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ shareId: 'SHAREID12345' }) });
    await revokeShareLink('p1');
    expect(mockDeleteDoc).toHaveBeenCalledWith({ col: 'shares', id: 'SHAREID12345' });
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      { col: 'palettes', id: 'p1' },
      { shareId: null, sharePermission: null }
    );
  });

  it('skips deletion when the palette has no shareId', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ shareId: null }) });
    await revokeShareLink('p1');
    expect(mockDeleteDoc).not.toHaveBeenCalled();
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      { col: 'palettes', id: 'p1' },
      { shareId: null, sharePermission: null }
    );
  });
});

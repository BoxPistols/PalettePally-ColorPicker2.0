// shares/{shareId} スナップショット方式の共有ロジックを、firebase/firestore SDK を
// モックして検証する（エミュレータ無しでオーケストレーションの正しさを担保）。
// 共有の書き込みは writeBatch でアトミックに行うため、batch の set/update/delete を検証する。

const mockGetDoc = jest.fn();
const mockBatchSet = jest.fn();
const mockBatchUpdate = jest.fn();
const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn().mockResolvedValue(undefined);

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_db: unknown, name: string) => ({ collection: name })),
  doc: jest.fn((_db: unknown, col: string, id: string) => ({ col, id })),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: () => 'TS',
  writeBatch: () => ({
    set: mockBatchSet,
    update: mockBatchUpdate,
    delete: mockBatchDelete,
    commit: mockBatchCommit,
  }),
}));

jest.mock('@/lib/firebase/config', () => ({ db: {} }));
jest.mock('nanoid', () => ({ nanoid: () => 'SHAREID12345' }));

import {
  generateShareLink,
  revokeShareLink,
  loadSharedPalette,
} from '@/lib/firebase/firestore';

beforeEach(() => {
  mockGetDoc.mockReset();
  mockBatchSet.mockReset();
  mockBatchUpdate.mockReset();
  mockBatchDelete.mockReset();
  mockBatchCommit.mockClear();
});

describe('generateShareLink', () => {
  it('atomically writes a snapshot to shares/{shareId} and flags the palette', async () => {
    // loadPalette() の getDoc
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'p1',
      data: () => ({ ownerUid: 'u1', name: 'My Palette', description: 'd', data: { colors: ['#fff'] } }),
    });

    const id = await generateShareLink('p1', 'view');
    expect(id).toBe('SHAREID12345');

    // shares コレクションにスナップショットを保存（バッチ）
    expect(mockBatchSet).toHaveBeenCalledTimes(1);
    const [ref, payload] = mockBatchSet.mock.calls[0];
    expect(ref).toEqual({ col: 'shares', id: 'SHAREID12345' });
    expect(payload).toMatchObject({ paletteId: 'p1', ownerUid: 'u1', permission: 'view', name: 'My Palette' });
    expect(payload.data).toEqual({ colors: ['#fff'] });

    // palette 側に shareId/sharePermission を記録（同一バッチ）
    expect(mockBatchUpdate).toHaveBeenCalledWith(
      { col: 'palettes', id: 'p1' },
      { shareId: 'SHAREID12345', sharePermission: 'view' }
    );
    // 1 回だけ commit される
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it('deletes a pre-existing share doc in the same batch (no orphan links)', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'p1',
      data: () => ({ ownerUid: 'u1', name: 'My', description: 'd', data: {}, shareId: 'OLDSHARE12345' }),
    });
    await generateShareLink('p1', 'view');
    expect(mockBatchDelete).toHaveBeenCalledWith({ col: 'shares', id: 'OLDSHARE12345' });
    expect(mockBatchSet).toHaveBeenCalledTimes(1);
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it('does not delete anything when the palette has no existing share', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'p1',
      data: () => ({ ownerUid: 'u1', name: 'My', description: 'd', data: {} }),
    });
    await generateShareLink('p1', 'view');
    expect(mockBatchDelete).not.toHaveBeenCalled();
  });
});

describe('loadSharedPalette', () => {
  it('returns a SharedPaletteView from the share snapshot', async () => {
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
    expect(res).toMatchObject({ id: 'p1', name: 'My', sharePermission: 'duplicate', shareId: 'SHAREID12345' });
  });

  it('returns null when the share does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false });
    expect(await loadSharedPalette('missing')).toBeNull();
  });
});

describe('revokeShareLink', () => {
  it('atomically deletes the share doc and clears the palette flags', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ shareId: 'SHAREID12345' }) });
    await revokeShareLink('p1');
    expect(mockBatchDelete).toHaveBeenCalledWith({ col: 'shares', id: 'SHAREID12345' });
    expect(mockBatchUpdate).toHaveBeenCalledWith(
      { col: 'palettes', id: 'p1' },
      { shareId: null, sharePermission: null }
    );
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it('skips deletion when the palette has no shareId', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ shareId: null }) });
    await revokeShareLink('p1');
    expect(mockBatchDelete).not.toHaveBeenCalled();
    expect(mockBatchUpdate).toHaveBeenCalledWith(
      { col: 'palettes', id: 'p1' },
      { shareId: null, sharePermission: null }
    );
  });
});

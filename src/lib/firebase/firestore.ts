import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { PaletteData, PaletteDocument, PaletteVersion } from '@/lib/types/palette';

function getDb() {
  if (!db) throw new Error('Firebase not configured');
  return db;
}

const PALETTES = 'palettes';
const VERSIONS = 'versions';
const SHARES = 'shares';

// 公開共有リンクの閲覧用ビュー。PaletteDocument 全体ではなく shares スナップショットに
// 実在するフィールドだけを持つ（PaletteDocument へ無理に cast して必須フィールド欠落を
// 隠さないための専用型）。
export type SharedPaletteView = {
  id: string;
  ownerUid: string;
  name: string;
  description: string;
  data: PaletteData;
  shareId: string;
  sharePermission: 'view' | 'duplicate';
};

// ── Save (create new) ──

export async function savePalette(
  uid: string,
  data: PaletteData,
  name: string,
  description = ''
): Promise<string> {
  const batch = writeBatch(getDb());

  const paletteRef = doc(collection(getDb(), PALETTES));
  batch.set(paletteRef, {
    ownerUid: uid,
    name,
    description,
    currentVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    shareId: null,
    sharePermission: null,
    tags: [],
    data,
  });

  const versionRef = doc(collection(paletteRef, VERSIONS));
  batch.set(versionRef, {
    version: 1,
    createdAt: serverTimestamp(),
    label: 'v1',
    data,
    changeNote: 'Initial save',
  });

  await batch.commit();
  return paletteRef.id;
}

// ── Update (new version) ──

export async function updatePalette(
  paletteId: string,
  data: PaletteData,
  changeNote = ''
): Promise<void> {
  const paletteRef = doc(getDb(), PALETTES, paletteId);
  const snap = await getDoc(paletteRef);
  if (!snap.exists()) throw new Error('Palette not found');

  const currentVersion = snap.data().currentVersion ?? 0;
  const nextVersion = currentVersion + 1;

  const batch = writeBatch(getDb());

  batch.update(paletteRef, {
    data,
    currentVersion: nextVersion,
    updatedAt: serverTimestamp(),
  });

  const versionRef = doc(collection(paletteRef, VERSIONS));
  batch.set(versionRef, {
    version: nextVersion,
    createdAt: serverTimestamp(),
    label: `v${nextVersion}`,
    data,
    changeNote,
  });

  await batch.commit();
}

// ── Load ──

export async function loadPalette(paletteId: string): Promise<PaletteDocument> {
  const snap = await getDoc(doc(getDb(), PALETTES, paletteId));
  if (!snap.exists()) throw new Error('Palette not found');
  return { id: snap.id, ...snap.data() } as PaletteDocument;
}

// ── List user's palettes ──

export async function listPalettes(uid: string): Promise<PaletteDocument[]> {
  const q = query(
    collection(getDb(), PALETTES),
    where('ownerUid', '==', uid),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as PaletteDocument);
}

// ── Delete ──

export async function deletePalette(paletteId: string): Promise<void> {
  // Delete versions subcollection first
  const versionsSnap = await getDocs(
    collection(getDb(), PALETTES, paletteId, VERSIONS)
  );
  const batch = writeBatch(getDb());
  for (const vDoc of versionsSnap.docs) batch.delete(vDoc.ref);
  batch.delete(doc(getDb(), PALETTES, paletteId));
  await batch.commit();
}

// ── Version History ──

export async function getVersionHistory(
  paletteId: string
): Promise<PaletteVersion[]> {
  const q = query(
    collection(getDb(), PALETTES, paletteId, VERSIONS),
    orderBy('version', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as PaletteVersion);
}

export async function restoreVersion(
  paletteId: string,
  versionId: string
): Promise<void> {
  const versionSnap = await getDoc(
    doc(getDb(), PALETTES, paletteId, VERSIONS, versionId)
  );
  if (!versionSnap.exists()) throw new Error('Version not found');

  const versionData = versionSnap.data().data as PaletteData;
  await updatePalette(paletteId, versionData, `Restored from v${versionSnap.data().version}`);
}

// ── Sharing ──

// 公開共有は shares/{shareId} のスナップショットとして保存する。
// palettes コレクションは owner 限定読み取りのまま残し、shareId(nanoid) を知らない
// 第三者がパレットを列挙・参照できないようにする（shares は get のみ許可、list 不可）。
export async function generateShareLink(
  paletteId: string,
  permission: 'view' | 'duplicate'
): Promise<string> {
  const { nanoid } = await import('nanoid');
  const shareId = nanoid(12);
  const palette = await loadPalette(paletteId);
  // share doc の作成/更新と palette メタの更新を 1 バッチでアトミックに行う。
  // 途中失敗で shares が孤児化したり shareId が stale になるのを防ぐ。
  const batch = writeBatch(getDb());
  // 再生成時は旧 share doc も同一バッチで削除し、古いリンクを無効化する
  if (palette.shareId) {
    batch.delete(doc(getDb(), SHARES, palette.shareId));
  }
  batch.set(doc(getDb(), SHARES, shareId), {
    paletteId,
    ownerUid: palette.ownerUid,
    permission,
    name: palette.name,
    description: palette.description ?? '',
    data: palette.data,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(getDb(), PALETTES, paletteId), {
    shareId,
    sharePermission: permission,
  });
  await batch.commit();
  return shareId;
}

export async function revokeShareLink(paletteId: string): Promise<void> {
  const snap = await getDoc(doc(getDb(), PALETTES, paletteId));
  const shareId = snap.exists() ? (snap.data().shareId as string | null) : null;
  // share doc 削除と palette メタのクリアを 1 バッチでアトミックに行う
  const batch = writeBatch(getDb());
  if (shareId) {
    batch.delete(doc(getDb(), SHARES, shareId));
  }
  batch.update(doc(getDb(), PALETTES, paletteId), {
    shareId: null,
    sharePermission: null,
  });
  await batch.commit();
}

export async function loadSharedPalette(
  shareId: string
): Promise<SharedPaletteView | null> {
  const snap = await getDoc(doc(getDb(), SHARES, shareId));
  if (!snap.exists()) return null;
  const s = snap.data();
  return {
    id: s.paletteId,
    ownerUid: s.ownerUid,
    name: s.name,
    description: s.description ?? '',
    data: s.data as PaletteData,
    shareId,
    sharePermission: s.permission,
  };
}

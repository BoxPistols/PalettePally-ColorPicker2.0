import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { PaletteData, PaletteDocument, PaletteVersion } from '@/lib/types/palette';

function getDb() {
  if (!db) throw new Error('Firebase not configured');
  return db;
}

const PALETTES = 'palettes';
const VERSIONS = 'versions';

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

export async function generateShareLink(
  paletteId: string,
  permission: 'view' | 'duplicate'
): Promise<string> {
  const { nanoid } = await import('nanoid');
  const shareId = nanoid(12);
  await updateDoc(doc(getDb(), PALETTES, paletteId), {
    shareId,
    sharePermission: permission,
  });
  return shareId;
}

export async function revokeShareLink(paletteId: string): Promise<void> {
  await updateDoc(doc(getDb(), PALETTES, paletteId), {
    shareId: null,
    sharePermission: null,
  });
}

export async function loadSharedPalette(
  shareId: string
): Promise<PaletteDocument | null> {
  const q = query(
    collection(getDb(), PALETTES),
    where('shareId', '==', shareId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as unknown as PaletteDocument;
}

export async function duplicatePalette(
  sourcePaletteId: string,
  targetUid: string,
  newName: string
): Promise<string> {
  const source = await loadPalette(sourcePaletteId);
  return savePalette(targetUid, source.data, newName, `Duplicated from "${source.name}"`);
}

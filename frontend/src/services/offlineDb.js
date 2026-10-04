import { openDB } from 'idb';

const DB_NAME = 'AshaSmartDB';
const DB_VERSION = 1;

let dbPromise;

export function getOfflineDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store for pending offline mutations
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp');
        }
        // Store for cached read data
        if (!db.objectStoreNames.contains('cachedData')) {
          db.createObjectStore('cachedData', { keyPath: 'key' });
        }
      }
    });
  }
  return dbPromise;
}

export async function addPendingAction(action) {
  const db = await getOfflineDB();
  const item = {
    ...action,
    timestamp: new Date().toISOString(),
    status: 'PENDING'
  };
  const id = await db.add('syncQueue', item);
  return { id, ...item };
}

export async function getPendingActions() {
  const db = await getOfflineDB();
  return db.getAll('syncQueue');
}

export async function removePendingAction(id) {
  const db = await getOfflineDB();
  return db.delete('syncQueue', id);
}

export async function updatePendingAction(id, updates) {
  const db = await getOfflineDB();
  const existing = await db.get('syncQueue', id);
  if (existing) {
    return db.put('syncQueue', { ...existing, ...updates });
  }
}

export async function cacheData(key, data) {
  const db = await getOfflineDB();
  return db.put('cachedData', { key, data, cachedAt: new Date().toISOString() });
}

export async function getCachedData(key) {
  const db = await getOfflineDB();
  const record = await db.get('cachedData', key);
  return record ? record.data : null;
}

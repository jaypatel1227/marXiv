import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface MarxivDB extends DBSchema {
  settings: {
    key: string;
    value: any;
  };
  notes: {
    key: string; // paperId
    value: {
      paperId: string;
      content: string;
      updatedAt: number;
    };
  };
  read_next: {
    key: string; // paperId
    value: {
      paperId: string;
      title: string;
      addedAt: number;
      [key: string]: any;
    };
  };
  api_keys: {
    key: string; // provider (e.g., 'openai')
    value: string;
  };
}

const DB_NAME = 'marxiv-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MarxivDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<MarxivDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes');
        }
        if (!db.objectStoreNames.contains('read_next')) {
          db.createObjectStore('read_next');
        }
        if (!db.objectStoreNames.contains('api_keys')) {
          db.createObjectStore('api_keys');
        }
      },
    });
  }
  return dbPromise;
}

// Settings
export async function getSetting<T = any>(key: string): Promise<T | undefined> {
  const db = await initDB();
  return db.get('settings', key);
}

export async function setSetting(key: string, value: any): Promise<void> {
  const db = await initDB();
  await db.put('settings', value, key);
}

// API Keys
export async function getApiKey(provider: string): Promise<string | undefined> {
  const db = await initDB();
  return db.get('api_keys', provider);
}

export async function setApiKey(provider: string, key: string): Promise<void> {
  const db = await initDB();
  await db.put('api_keys', key, provider);
}

// Notes
export async function getNote(paperId: string) {
  const db = await initDB();
  return db.get('notes', paperId);
}

export async function saveNote(paperId: string, content: string): Promise<void> {
  const db = await initDB();
  await db.put('notes', {
    paperId,
    content,
    updatedAt: Date.now(),
  }, paperId);
}

export async function getAllNotes() {
  const db = await initDB();
  return db.getAll('notes');
}

// Read Next
export async function addToReadNext(paperId: string, title: string, metadata: any = {}): Promise<void> {
  const db = await initDB();
  await db.put('read_next', {
    paperId,
    title,
    addedAt: Date.now(),
    ...metadata,
  }, paperId);
}

export async function removeFromReadNext(paperId: string): Promise<void> {
  const db = await initDB();
  await db.delete('read_next', paperId);
}

export async function getReadNextList() {
  const db = await initDB();
  return db.getAll('read_next');
}

export async function isInReadNext(paperId: string): Promise<boolean> {
  const db = await initDB();
  const item = await db.get('read_next', paperId);
  return !!item;
}

// Export/Import
export async function exportStorageData(): Promise<string> {
  const db = await initDB();
  const data: Record<string, any> = {};

  const stores = ['settings', 'notes', 'read_next', 'api_keys'] as const;

  for (const store of stores) {
    const keys = await db.getAllKeys(store);
    const values = await db.getAll(store);
    data[store] = keys.map((key, i) => ({ key, value: values[i] }));
  }

  return JSON.stringify(data, null, 2);
}

export async function importStorageData(jsonString: string): Promise<void> {
  try {
    const data = JSON.parse(jsonString);
    const db = await initDB();
    const stores = ['settings', 'notes', 'read_next', 'api_keys'] as const;

    // We use a transaction for atomicity per store, or global if possible.
    // idb's transaction handling is a bit specific, let's just do sequential puts for simplicity
    // or create one transaction for all stores.

    const tx = db.transaction(stores, 'readwrite');

    for (const storeName of stores) {
      if (data[storeName] && Array.isArray(data[storeName])) {
        const store = tx.objectStore(storeName);
        // Clear existing data? The requirement didn't specify, but import usually implies restore.
        // Let's clear to avoid stale data mixing with imported data,
        // OR we can merge. Merging is safer for "adding" data, clearing is better for "restoring backup".
        // Given "Export import of all settings", it feels like a backup/restore.
        // I will clear the store first.
        await store.clear();

        for (const item of data[storeName]) {
            // Check if item has key/value structure from our export
            if (item && typeof item === 'object' && 'key' in item && 'value' in item) {
                 // For stores where we use out-of-line keys (settings, api_keys), we need the key.
                 // For stores with in-line keys (notes, read_next), the key is in the value (paperId),
                 // but we also passed it as the key argument in put().
                 // Our export format { key, value } works for both `put(value, key)`.
                 await store.put(item.value, item.key);
            }
        }
      }
    }

    await tx.done;
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format or import failed');
  }
}

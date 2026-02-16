import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// 1. Define the full Settings Schema
export interface SettingsSchema {
  theme: 'research' | 'swiss' | 'amber-crt' | 'midnight-soup' | 'brutalist';
  font: 'research' | 'editorial' | 'raw' | 'modern-art';
  // Use generic records for now as requested ("do not make the schema for all of the new objects")
  // but typed enough to be useful
  notes: Record<string, { content: string; updatedAt: number }>;
  readNext: string[]; // List of paper IDs
  apiKeys: Record<string, string>; // provider -> key
  // Allow extensibility
  [key: string]: any;
}

interface MarxivDB extends DBSchema {
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'marxiv-db';
const DB_VERSION = 2; // Bump version to force migration/re-creation if needed

let dbPromise: Promise<IDBPDatabase<MarxivDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<MarxivDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Migration strategy: simpler to just recreate for this pivot
        // In a real app with users, we'd read old stores and migrate data.
        // Since "no users yet", we can be aggressive.

        if (oldVersion < 2) {
            // Delete old stores if they exist
            if (db.objectStoreNames.contains('notes')) db.deleteObjectStore('notes');
            if (db.objectStoreNames.contains('read_next')) db.deleteObjectStore('read_next');
            if (db.objectStoreNames.contains('api_keys')) db.deleteObjectStore('api_keys');

            // Ensure settings store exists
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings');
            }
        }
      },
    });
  }
  return dbPromise;
}

// Generic Typed Getter
export async function getSetting<K extends keyof SettingsSchema>(key: K): Promise<SettingsSchema[K] | undefined> {
  const db = await initDB();
  return db.get('settings', key as string);
}

// Generic Typed Setter
export async function setSetting<K extends keyof SettingsSchema>(key: K, value: SettingsSchema[K]): Promise<void> {
  const db = await initDB();
  await db.put('settings', value, key as string);
}

// Export Helper
export async function exportStorageData(): Promise<string> {
  const db = await initDB();
  const keys = await db.getAllKeys('settings');
  const values = await db.getAll('settings');

  const data: Record<string, any> = {};
  keys.forEach((key, index) => {
    data[key as string] = values[index];
  });

  return JSON.stringify(data, null, 2);
}

// Import Helper
export async function importStorageData(jsonString: string): Promise<void> {
  try {
    const data = JSON.parse(jsonString);
    const db = await initDB();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');

    // Clear existing settings or merge?
    // Usually import implies "restore state", so clear might be safer to avoid ghosts,
    // but merging is safer for preserving existing data.
    // Let's clear to be clean as per previous logic.
    await store.clear();

    for (const [key, value] of Object.entries(data)) {
        await store.put(value, key);
    }

    await tx.done;
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format or import failed');
  }
}

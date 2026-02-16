import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export type Theme = 'research' | 'swiss' | 'amber-crt' | 'midnight-soup' | 'brutalist';
export type Font = 'research' | 'editorial' | 'raw' | 'modern-art';

// 1. Define the full Settings Schema
export interface SettingsSchema {
  theme: Theme;
  font: Font;
}

interface MarxivDB extends DBSchema {
  settings: {
    key: string;
    value: SettingsSchema[keyof SettingsSchema];
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
      },
    });
  }
  return dbPromise;
}

// Generic Typed Getter
export async function getSetting<K extends keyof SettingsSchema>(key: K): Promise<SettingsSchema[K] | undefined> {
  const db = await initDB();
  return db.get('settings', key as string) as Promise<SettingsSchema[K] | undefined>;
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

    // Clear existing settings to avoid ghosts
    await store.clear();

    for (const [key, value] of Object.entries(data)) {
        // We can't easily validate generic import data against the schema at runtime without Zod/etc.
        // so we cast to any for the put, trusting the source or the interface usage.
        await store.put(value as any, key);
    }

    await tx.done;
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format or import failed');
  }
}

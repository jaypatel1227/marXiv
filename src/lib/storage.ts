import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export type Theme = 'research' | 'swiss' | 'amber-crt' | 'midnight-soup' | 'brutalist';
export type Font = 'research' | 'editorial' | 'raw' | 'modern-art';

export type ApiProvider = 'openrouter';

export interface ApiCredential {
  provider: ApiProvider;
  key: string;
}

// 1. Define the full Settings Schema
export interface SettingsSchema {
  theme: Theme;
  font: Font;
  apiCredentials: ApiCredential[];
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

  // We explicitly fetch known settings to ensure they are included even if not explicitly set (using defaults)
  // Or we fetch all keys and restructure them.
  // The user requested `theme` and `font` specifically be wrapped in `personalization`.

  const theme = await getSetting('theme') || 'research';
  const font = await getSetting('font') || 'research';
  const apiCredentials = await getSetting('apiCredentials') || [];

  // Get any other keys that might exist in the future (though schema is strict right now, IDB is loose)
  const keys = await db.getAllKeys('settings');
  const values = await db.getAll('settings');

  const otherData: Record<string, any> = {};

  keys.forEach((key, index) => {
    const k = key as string;
    if (k !== 'theme' && k !== 'font' && k !== 'apiCredentials') {
        otherData[k] = values[index];
    }
  });

  const exportData = {
      personalization: {
          theme,
          font
      },
      apiCredentials,
      ...otherData
  };

  return JSON.stringify(exportData, null, 2);
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

    // Handle nested personalization object
    if (data.personalization) {
        if (data.personalization.theme) {
            await store.put(data.personalization.theme, 'theme');
        }
        if (data.personalization.font) {
            await store.put(data.personalization.font, 'font');
        }
        // Remove it so we don't double import if we iterate
        delete data.personalization;
    }

    // Import remaining keys
    for (const [key, value] of Object.entries(data)) {
        await store.put(value as any, key);
    }

    await tx.done;
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format or import failed');
  }
}

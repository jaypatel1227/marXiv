import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export type Theme = 'research' | 'swiss' | 'amber-crt' | 'midnight-soup' | 'brutalist';
export type Font = 'research' | 'editorial' | 'raw' | 'modern-art';

export type ApiProvider = 'openrouter' | 'openai' | 'anthropic' | 'google';

export interface ApiCredential {
  provider: ApiProvider;
  key: string;
}

// 1. Define the full Settings Schema
export interface SettingsSchema {
  theme: Theme;
  font: Font;
  apiCredentials: ApiCredential[];
  defaultModel?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface PaperNote {
  paperId: string;
  paperTitle: string;
  notes: Note[];
}

interface MarxivDB extends DBSchema {
  settings: {
    key: string;
    value: SettingsSchema[keyof SettingsSchema];
  };
  notes: {
    key: string; // paperId
    value: PaperNote;
  };
  meta: {
      key: string; // e.g., 'notes_count'
      value: number;
  }
}

const DB_NAME = 'marxiv-db';
const DB_VERSION = 3; // Incremented for meta store

let dbPromise: Promise<IDBPDatabase<MarxivDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<MarxivDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'paperId' });
        }
        if (!db.objectStoreNames.contains('meta')) {
            db.createObjectStore('meta');
        }
      },
    });
  }
  return dbPromise;
}

// Generic Typed Getter for Settings
export async function getSetting<K extends keyof SettingsSchema>(key: K): Promise<SettingsSchema[K] | undefined> {
  const db = await initDB();
  return db.get('settings', key as string) as Promise<SettingsSchema[K] | undefined>;
}

// Generic Typed Setter for Settings
export async function setSetting<K extends keyof SettingsSchema>(key: K, value: SettingsSchema[K]): Promise<void> {
  const db = await initDB();
  await db.put('settings', value, key as string);
}

// Notes Helpers

export async function getNotesForPaper(paperId: string): Promise<PaperNote | undefined> {
  const db = await initDB();
  return db.get('notes', paperId);
}

export async function getAllNotes(offset: number = 0, limit: number = 20): Promise<{ notes: PaperNote[], total: number }> {
    const db = await initDB();
    const tx = db.transaction(['notes', 'meta'], 'readonly');
    const notesStore = tx.objectStore('notes');
    const metaStore = tx.objectStore('meta');

    // Get total count
    const total = await metaStore.get('notes_count') || 0;

    // Get paginated notes
    let notes: PaperNote[] = [];
    let cursor = await notesStore.openCursor();

    // Advance cursor to offset
    if (offset > 0 && cursor) {
        await cursor.advance(offset);
    }

    // Collect up to limit
    while (cursor && notes.length < limit) {
        notes.push(cursor.value);
        cursor = await cursor.continue();
    }

    await tx.done;
    return { notes, total };
}

export async function addNoteToPaper(paperId: string, paperTitle: string, content: string): Promise<Note> {
  const db = await initDB();
  const tx = db.transaction(['notes', 'meta'], 'readwrite');
  const notesStore = tx.objectStore('notes');
  const metaStore = tx.objectStore('meta');

  let paperNote = await notesStore.get(paperId);
  let isNewPaper = false;

  if (!paperNote) {
    paperNote = {
      paperId,
      paperTitle,
      notes: []
    };
    isNewPaper = true;
  } else {
      paperNote.paperTitle = paperTitle;
  }

  const newNote: Note = {
    id: crypto.randomUUID(),
    content,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  paperNote.notes.push(newNote);
  await notesStore.put(paperNote);

  // Increment global count
  let currentCount = await metaStore.get('notes_count') || 0;
  await metaStore.put(currentCount + 1, 'notes_count');

  await tx.done;

  return newNote;
}

export async function updateNoteInPaper(paperId: string, noteId: string, content: string): Promise<void> {
    const db = await initDB();
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');

    const paperNote = await store.get(paperId);
    if (!paperNote) throw new Error('Paper not found');

    const noteIndex = paperNote.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) throw new Error('Note not found');

    paperNote.notes[noteIndex].content = content;
    paperNote.notes[noteIndex].updatedAt = Date.now();

    await store.put(paperNote);
    await tx.done;
}

export async function deleteNoteFromPaper(paperId: string, noteId: string): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(['notes', 'meta'], 'readwrite');
    const notesStore = tx.objectStore('notes');
    const metaStore = tx.objectStore('meta');

    const paperNote = await notesStore.get(paperId);
    if (!paperNote) return;

    const initialNoteCount = paperNote.notes.length;
    paperNote.notes = paperNote.notes.filter(n => n.id !== noteId);

    if (paperNote.notes.length < initialNoteCount) {
         // Decrement global count
        let currentCount = await metaStore.get('notes_count') || 0;
        if (currentCount > 0) {
            await metaStore.put(currentCount - 1, 'notes_count');
        }

        if (paperNote.notes.length === 0) {
            await notesStore.delete(paperId);
        } else {
            await notesStore.put(paperNote);
        }
    }

    await tx.done;
}

export async function reorderNotesInPaper(paperId: string, newNotes: Note[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');

    const paperNote = await store.get(paperId);
    if (!paperNote) throw new Error('Paper not found');

    paperNote.notes = newNotes;

    await store.put(paperNote);
    await tx.done;
}


// Export Helper
export async function exportStorageData(): Promise<string> {
  const db = await initDB();

  // We explicitly fetch known settings to ensure they are included even if not explicitly set (using defaults)
  // Or we fetch all keys and restructure them.
  // The user requested `theme`, `font` and `defaultModel` specifically be wrapped in `personalization`.

  const theme = await getSetting('theme') || 'research';
  const font = await getSetting('font') || 'research';
  const defaultModel = await getSetting('defaultModel') || '';
  const apiCredentials = await getSetting('apiCredentials') || [];

  const settingKeys = await db.getAllKeys('settings');
  const settingValues = await db.getAll('settings');

  const otherSettings: Record<string, any> = {};

  settingKeys.forEach((key, index) => {
    const k = key as string;
    if (k !== 'theme' && k !== 'font' && k !== 'defaultModel' && k !== 'apiCredentials') {
        otherSettings[k] = settingValues[index];
    }
  });

  const allNotes = await db.getAll('notes');
  const metaCount = await db.get('meta', 'notes_count') || 0;

  const exportData = {
      personalization: {
          theme,
          font,
          defaultModel
      },
      ...otherSettings,
      notes: allNotes,
      meta: {
          notes_count: metaCount
      }
  };

  return JSON.stringify(exportData, null, 2);
}

// Import Helper
export async function importStorageData(jsonString: string): Promise<void> {
  try {
    const data = JSON.parse(jsonString);
    const db = await initDB();

    // Transaction for Settings
    const txSettings = db.transaction('settings', 'readwrite');
    const storeSettings = txSettings.objectStore('settings');

    await storeSettings.clear();

    if (data.personalization) {
        if (data.personalization.theme) {
            await storeSettings.put(data.personalization.theme, 'theme');
        }
        if (data.personalization.font) {
            await storeSettings.put(data.personalization.font, 'font');
        }
        if (data.personalization.defaultModel) {
            await storeSettings.put(data.personalization.defaultModel, 'defaultModel');
        }
        // Remove it so we don't double import if we iterate
        delete data.personalization;
    }

    const notesData = data.notes;
    if (notesData) delete data.notes;

    const metaData = data.meta;
    if (metaData) delete data.meta;

    for (const [key, value] of Object.entries(data)) {
        await storeSettings.put(value as any, key);
    }

    await txSettings.done;

    // Transaction for Notes and Meta
    if (Array.isArray(notesData)) {
        const txNotes = db.transaction(['notes', 'meta'], 'readwrite');
        const storeNotes = txNotes.objectStore('notes');
        const storeMeta = txNotes.objectStore('meta');

        await storeNotes.clear();
        await storeMeta.clear();

        let calculatedCount = 0;
        for (const paperNote of notesData) {
            if (paperNote.paperId && Array.isArray(paperNote.notes)) {
                await storeNotes.put(paperNote);
                calculatedCount += paperNote.notes.length;
            }
        }

        // Use imported count if available and matches logic, or recalculate
        // Recalculating is safer to ensure consistency
        await storeMeta.put(calculatedCount, 'notes_count');

        await txNotes.done;
    }

  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format or import failed');
  }
}

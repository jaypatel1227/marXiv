import { useState, useEffect, useCallback } from 'react';
import {
  getSetting, setSetting,
  getApiKey, setApiKey,
  saveNote, getNote,
  addToReadNext, removeFromReadNext, isInReadNext,
  exportStorageData, importStorageData
} from '../lib/storage';

export type Theme = 'research' | 'swiss' | 'amber-crt' | 'midnight-soup' | 'brutalist';
export type Font = 'research' | 'editorial' | 'raw' | 'modern-art';

interface StorageState {
  theme: Theme;
  font: Font;
  isLoading: boolean;
}

const STORAGE_EVENT = 'marxiv-storage-update';

export function useStorage() {
  // Initialize from localStorage to avoid hydration mismatch if possible
  // and to ensure immediate availability of theme settings
  const [state, setState] = useState<StorageState>(() => {
    if (typeof window !== 'undefined') {
      return {
        theme: (localStorage.getItem('theme') as Theme) || 'research',
        font: (localStorage.getItem('font') as Font) || 'research',
        isLoading: false,
      };
    }
    return {
      theme: 'research',
      font: 'research',
      isLoading: true,
    };
  });

  // Helper to apply theme to DOM
  const applyThemeToDOM = useCallback((theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'swiss') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const applyFontToDOM = useCallback((font: Font) => {
    document.documentElement.setAttribute('data-font', font);
  }, []);

  // Sync with IndexedDB on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await getSetting<Theme>('theme');
        const storedFont = await getSetting<Font>('font');

        // We only update if the DB has a value and it differs from the initial local state
        // We use functional updates or refs if we needed current state, but here we just want to apply
        // the DB value if it exists, assuming DB is the source of truth for "restored session"
        if (storedTheme) {
            setState(s => {
                if (s.theme !== storedTheme) {
                    applyThemeToDOM(storedTheme);
                    localStorage.setItem('theme', storedTheme);
                    return { ...s, theme: storedTheme };
                }
                return s;
            });
        }
        if (storedFont) {
            setState(s => {
                if (s.font !== storedFont) {
                    applyFontToDOM(storedFont);
                    localStorage.setItem('font', storedFont);
                    return { ...s, font: storedFont };
                }
                return s;
            });
        }
      } catch (e) {
        console.error('Failed to load settings from DB:', e);
      } finally {
        setState(s => ({ ...s, isLoading: false }));
      }
    };

    loadSettings();
  }, []);

  // Listen for storage updates from other components/tabs
  useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent) => {
      const { key, value } = event.detail;
      if (key === 'theme') {
        setState(s => ({ ...s, theme: value }));
        applyThemeToDOM(value);
      } else if (key === 'font') {
        setState(s => ({ ...s, font: value }));
        applyFontToDOM(value);
      }
    };

    window.addEventListener(STORAGE_EVENT as any, handleStorageUpdate);
    return () => window.removeEventListener(STORAGE_EVENT as any, handleStorageUpdate);
  }, [applyThemeToDOM, applyFontToDOM]);

  const setTheme = useCallback((newTheme: Theme) => {
    setState(s => ({ ...s, theme: newTheme }));
    applyThemeToDOM(newTheme);

    localStorage.setItem('theme', newTheme);
    setSetting('theme', newTheme).catch(console.error);
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: 'theme', value: newTheme } }));
  }, [applyThemeToDOM]);

  const setFont = useCallback((newFont: Font) => {
    setState(s => ({ ...s, font: newFont }));
    applyFontToDOM(newFont);

    localStorage.setItem('font', newFont);
    setSetting('font', newFont).catch(console.error);
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: 'font', value: newFont } }));
  }, [applyFontToDOM]);

  // API Key helpers
  const updateApiKey = useCallback(async (provider: string, key: string) => {
    await setApiKey(provider, key);
  }, []);

  const getApiKeyValue = useCallback(async (provider: string) => {
    return getApiKey(provider);
  }, []);

  // Note helpers
  const savePaperNote = useCallback(async (paperId: string, content: string) => {
      await saveNote(paperId, content);
  }, []);

  const getPaperNote = useCallback(async (paperId: string) => {
      return getNote(paperId);
  }, []);

  // Read Next helpers
  const addToReadList = useCallback(async (paperId: string, title: string, metadata?: any) => {
      await addToReadNext(paperId, title, metadata);
  }, []);

  const removeFromReadList = useCallback(async (paperId: string) => {
      await removeFromReadNext(paperId);
  }, []);

  const isPaperInReadList = useCallback(async (paperId: string) => {
      return isInReadNext(paperId);
  }, []);

  // Export/Import
  const exportData = useCallback(async () => {
    return exportStorageData();
  }, []);

  const importData = useCallback(async (json: string) => {
    await importStorageData(json);
    // Reload state after import
    const newTheme = await getSetting<Theme>('theme');
    const newFont = await getSetting<Font>('font');
    if (newTheme) setTheme(newTheme);
    if (newFont) setFont(newFont);
  }, [setTheme, setFont]);

  return {
    ...state,
    setTheme,
    setFont,
    setApiKey: updateApiKey,
    getApiKey: getApiKeyValue,
    saveNote: savePaperNote,
    getNote: getPaperNote,
    addToReadNext: addToReadList,
    removeFromReadNext: removeFromReadList,
    isInReadNext: isPaperInReadList,
    exportData,
    importData,
  };
}

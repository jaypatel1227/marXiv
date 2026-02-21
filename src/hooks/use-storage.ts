import { useState, useEffect, useCallback } from 'react';
import {
  getSetting, setSetting,
  exportStorageData, importStorageData,
  type SettingsSchema,
  type ApiCredential
} from '../lib/storage';

export type Theme = 'research' | 'swiss' | 'amber-crt' | 'midnight-soup' | 'brutalist';
export type Font = 'research' | 'editorial' | 'raw' | 'modern-art';

interface StorageState {
  theme: Theme;
  font: Font;
  apiCredentials: ApiCredential[];
  isLoading: boolean;
}

const STORAGE_EVENT = 'marxiv-storage-update';

export function useStorage() {
  // Initialize from localStorage (Cache for FOUC prevention)
  // This is the "fast path"
  const [state, setState] = useState<StorageState>(() => {
    if (typeof window !== 'undefined') {
      return {
        theme: (localStorage.getItem('theme') as Theme) || 'research',
        font: (localStorage.getItem('font') as Font) || 'research',
        apiCredentials: [],
        isLoading: false,
      };
    }
    return {
      theme: 'research',
      font: 'research',
      apiCredentials: [],
      isLoading: true,
    };
  });

  // Sync with IndexedDB on mount (Source of Truth)
  // If IDB differs from localStorage, IDB wins (eventually)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await getSetting<Theme>('theme');
        const storedFont = await getSetting<Font>('font');
        const storedApiCredentials = await getSetting<ApiCredential[]>('apiCredentials');

        if (storedTheme) {
            setState(s => {
                if (s.theme !== storedTheme) {
                    applyThemeToDOM(storedTheme);
                    localStorage.setItem('theme', storedTheme); // Update cache
                    return { ...s, theme: storedTheme };
                }
                return s;
            });
        }
        if (storedFont) {
            setState(s => {
                if (s.font !== storedFont) {
                    applyFontToDOM(storedFont);
                    localStorage.setItem('font', storedFont); // Update cache
                    return { ...s, font: storedFont };
                }
                return s;
            });
        }
        if (storedApiCredentials) {
            setState(s => ({ ...s, apiCredentials: storedApiCredentials }));
        }
      } catch (e) {
        console.error('Failed to load settings from DB:', e);
      } finally {
        setState(s => ({ ...s, isLoading: false }));
      }
    };

    loadSettings();
  }, []);

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
      } else if (key === 'apiCredentials') {
        setState(s => ({ ...s, apiCredentials: value }));
      }
    };

    window.addEventListener(STORAGE_EVENT as any, handleStorageUpdate);
    return () => window.removeEventListener(STORAGE_EVENT as any, handleStorageUpdate);
  }, [applyThemeToDOM, applyFontToDOM]);

  const setTheme = useCallback((newTheme: Theme) => {
    setState(s => ({ ...s, theme: newTheme }));
    applyThemeToDOM(newTheme);

    // Update Cache (localStorage) for FOUC prevention
    localStorage.setItem('theme', newTheme);

    // Update Source of Truth (IndexedDB)
    setSetting('theme', newTheme).catch(console.error);

    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: 'theme', value: newTheme } }));
  }, [applyThemeToDOM]);

  const setFont = useCallback((newFont: Font) => {
    setState(s => ({ ...s, font: newFont }));
    applyFontToDOM(newFont);

    // Update Cache
    localStorage.setItem('font', newFont);

    // Update Source of Truth
    setSetting('font', newFont).catch(console.error);

    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: 'font', value: newFont } }));
  }, [applyFontToDOM]);

  const setApiCredentials = useCallback((newCredentials: ApiCredential[]) => {
    setState(s => ({ ...s, apiCredentials: newCredentials }));
    // Update Source of Truth
    setSetting('apiCredentials', newCredentials).catch(console.error);
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: 'apiCredentials', value: newCredentials } }));
  }, []);

  // Generic Helpers for future expansion (Notes, Read Next, API Keys)
  // We expose specific typed helpers if needed, or generic ones.
  // Given "Do not make the schema for all of the new objects", let's keep it simple.

  const updateSetting = useCallback(async <K extends keyof SettingsSchema>(key: K, value: SettingsSchema[K]) => {
      await setSetting(key, value);
  }, []);

  const getSettingValue = useCallback(async <K extends keyof SettingsSchema>(key: K) => {
      return getSetting(key);
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
    const newCredentials = await getSetting<ApiCredential[]>('apiCredentials');

    if (newTheme) setTheme(newTheme);
    if (newFont) setFont(newFont);
    if (newCredentials) setApiCredentials(newCredentials);
  }, [setTheme, setFont, setApiCredentials]);

  return {
    ...state,
    setTheme,
    setFont,
    setApiCredentials,
    updateSetting,
    getSettingValue,
    exportData,
    importData,
  };
}

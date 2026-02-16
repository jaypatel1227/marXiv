import React, { useState, useEffect, useRef } from 'react';
import { Settings, Check, Type, Palette, X, Database, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStorage, type Theme, type Font } from '@/hooks/use-storage';

const themes = [
  { id: 'research', name: 'Research Terminal', color: '#00f3ff', preview: 'bg-[#050505] border-[#00f3ff]' },
  { id: 'swiss', name: 'Swiss Paper', color: '#cc0000', preview: 'bg-[#fbfbfb] border-[#cc0000]' },
  { id: 'amber-crt', name: 'Amber CRT', color: '#ffb000', preview: 'bg-[#050505] border-[#ffb000]' },
  { id: 'midnight-soup', name: 'Midnight Soup', color: '#a060ff', preview: 'bg-[#0f0518] border-[#a060ff]' },
  { id: 'brutalist', name: 'Brutalist Blueprint', color: '#0022cc', preview: 'bg-[#0022cc] border-white' },
];

const fonts = [
  { id: 'research', name: 'Research', desc: 'Rajdhani / Titillium' },
  { id: 'editorial', name: 'Editorial', desc: 'Playfair / Alice' },
  { id: 'raw', name: 'Raw', desc: 'Courier Prime' },
  { id: 'modern-art', name: 'Modern Art', desc: 'Syne / Outfit' },
];

export default function ThemeSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, font, setTheme, setFont, exportData, importData } = useStorage();
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setImportStatus('idle');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async () => {
    try {
        const json = await exportData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marxiv-data-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Export failed:', e);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        await importData(text);
        setImportStatus('success');

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Reset status after 3s
        setTimeout(() => setImportStatus('idle'), 3000);
    } catch (e) {
        console.error('Import failed:', e);
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-primary transition-colors relative"
        aria-label="Theme Settings"
      >
        <Settings className={`h-5 w-5 transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden max-h-[80vh] overflow-y-auto"
          >
             <div className="p-4 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h3 className="font-display font-bold text-lg text-foreground">Appearance & Data</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Theme Selector */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Palette className="h-4 w-4" />
                        <span>Theme</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id as Theme)}
                                className={`group relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                                    theme === t.id
                                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]'
                                    : 'border-border bg-background/50 hover:border-primary/50 hover:bg-background'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full shadow-inner border-2 ${t.preview.replace('border-', 'border-')}`}
                                     style={{ backgroundColor: t.id === 'swiss' ? '#fbfbfb' : (t.id === 'brutalist' ? '#0022cc' : (t.id === 'midnight-soup' ? '#0f0518' : '#050505')), borderColor: t.color }}></div>
                                <span className={`text-xs font-medium ${theme === t.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                    {t.name.split(' ')[0]}
                                </span>
                                {theme === t.id && (
                                    <div className="absolute top-1 right-1 text-primary">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Selector */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Type className="h-4 w-4" />
                        <span>Typography</span>
                    </div>
                    <div className="space-y-1">
                        {fonts.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFont(f.id as Font)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 ${
                                    font === f.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-transparent hover:bg-muted/50'
                                }`}
                            >
                                <div className="flex flex-col items-start">
                                    <span className={`text-sm font-medium ${font === f.id ? 'text-foreground' : 'text-foreground/80'}`}>
                                        {f.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{f.desc}</span>
                                </div>
                                {font === f.id && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Management */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Database className="h-4 w-4" />
                        <span>Data Storage</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={handleExport} className="w-full gap-2 justify-start h-9">
                            <Download className="h-3.5 w-3.5" />
                            Export Data
                        </Button>
                        <Button variant="outline" size="sm" onClick={triggerFileInput} className="w-full gap-2 justify-start h-9">
                            <Upload className="h-3.5 w-3.5" />
                            Import Data
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".json"
                            onChange={handleImport}
                        />
                    </div>

                    {importStatus === 'success' && (
                        <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 p-2 rounded">
                            <CheckCircle2 className="h-3 w-3" />
                            Data imported successfully!
                        </div>
                    )}
                    {importStatus === 'error' && (
                        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-2 rounded">
                            <AlertCircle className="h-3 w-3" />
                            Import failed. check file.
                        </div>
                    )}
                </div>
             </div>

             {/* Footer gradient */}
             <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

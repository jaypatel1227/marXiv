import React, { useRef } from 'react';
import { Download, Upload, Database, Palette, Check, Type, ArrowLeft } from 'lucide-react';
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

export default function AdvancedSettings() {
  const { theme, setTheme, font, setFont, exportData, importData } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = async () => {
    try {
        const json = await exportData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marxiv-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Export failed", e);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        await importData(text);
        alert("Data imported successfully!");
    } catch (e) {
        console.error("Import failed", e);
        alert("Import failed. Please check the console for details.");
    } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
        <div>
            <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary transition-colors">
                <a href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </a>
            </Button>
        </div>

        <div className="space-y-2 pb-4 border-b border-border">
            <h2 className="text-2xl font-display font-bold text-foreground">Advanced Settings</h2>
            <p className="text-muted-foreground">Manage your local data and application preferences.</p>
        </div>

        <div className="space-y-6">
            {/* Appearance Section */}
            <div className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm space-y-6">
                 {/* Themes */}
                 <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
                            <Palette className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="font-medium text-foreground">Theme</h3>
                            <p className="text-sm text-muted-foreground">
                                Choose your preferred visual theme for the application.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                                    {t.name}
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

                <div className="border-t border-border/50"></div>

                {/* Fonts */}
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
                            <Type className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="font-medium text-foreground">Typography</h3>
                            <p className="text-sm text-muted-foreground">
                                Select the font pairing that suits your reading style.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fonts.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFont(f.id as Font)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                    font === f.id
                                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_-3px_rgba(var(--primary),0.1)]'
                                    : 'border-border bg-background/50 hover:border-primary/50 hover:bg-background'
                                }`}
                            >
                                <div className="flex flex-col items-start text-left">
                                    <span className={`text-sm font-medium ${font === f.id ? 'text-primary' : 'text-foreground/80'}`}>
                                        {f.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{f.desc}</span>
                                </div>
                                {font === f.id && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            {/* Data Management Section */}
            <div className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
                        <Database className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="font-medium text-foreground">Data Management</h3>
                        <p className="text-sm text-muted-foreground">
                            Export your settings and preferences to a JSON file for backup or transfer between devices.
                            Importing will overwrite your current configuration.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button variant="outline" onClick={handleDownload} className="flex-1 gap-2">
                        <Download className="h-4 w-4" />
                        Download Backup
                    </Button>

                    <Button variant="outline" onClick={handleImportClick} className="flex-1 gap-2">
                        <Upload className="h-4 w-4" />
                        Import Backup
                    </Button>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
        </div>
    </div>
  );
}

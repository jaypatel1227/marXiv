import React, { useRef, useState } from 'react';
import { Download, Upload, Database, Palette, Check, Type, ArrowLeft, Key, ChevronDown, ChevronUp, Eye, EyeOff, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorage, type Theme, type Font } from '@/hooks/use-storage';
import { MODELS, PROVIDERS } from '@/lib/llm';

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

const PROVIDER_URLS: Record<string, string> = {
    openrouter: 'https://openrouter.ai/keys',
    openai: 'https://platform.openai.com/api-keys',
    anthropic: 'https://console.anthropic.com/settings/keys',
    google: 'https://aistudio.google.com/app/apikey',
};

export default function AdvancedSettings() {
  const { theme, setTheme, font, setFont, exportData, importData, apiCredentials, setApiCredentials, defaultModel, setDefaultModel } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isApiSectionOpen, setIsApiSectionOpen] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  // Filter available models based on configured keys
  const availableModels = MODELS.filter(m =>
    apiCredentials.some(c => c.provider === m.provider && c.key)
  );

  const toggleReveal = (provider: string) => {
    setRevealedKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleKeyChange = (provider: string, newKey: string) => {
    const newCredentials = [...(apiCredentials || [])];
    const index = newCredentials.findIndex(c => c.provider === provider);

    if (index >= 0) {
        newCredentials[index] = { ...newCredentials[index], key: newKey };
    } else {
        newCredentials.push({ provider: provider as any, key: newKey });
    }
    setApiCredentials(newCredentials);

    // If the key was previously empty (or we are typing), ensure it stays revealed so we can continue typing
    if (!revealedKeys[provider]) {
        setRevealedKeys(prev => ({ ...prev, [provider]: true }));
    }
  };

  const getCredential = (provider: string) => apiCredentials?.find(c => c.provider === provider)?.key || '';

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


            {/* Default Model Section */}
            <div className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="font-medium text-foreground">Default Model</h3>
                        <p className="text-sm text-muted-foreground">
                            Select the AI model used for summaries and chat.
                        </p>
                    </div>
                </div>

                <div className="pt-2">
                    {availableModels.length > 0 ? (
                        <div className="relative">
                            <select
                                value={defaultModel || ''}
                                onChange={(e) => setDefaultModel(e.target.value)}
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                            >
                                <option value="" disabled>Select a model</option>
                                {availableModels.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({PROVIDERS.find(p => p.id === m.provider)?.name})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border border-border/50">
                            No models available. Please configure an API key below.
                        </div>
                    )}
                </div>
            </div>

            {/* API Credentials Section */}
            <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-200">
                <button
                    onClick={() => setIsApiSectionOpen(!isApiSectionOpen)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-primary/5 transition-colors"
                >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Key className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-foreground">API Credentials</h3>
                        <p className="text-sm text-muted-foreground">Manage API keys for external model providers.</p>
                    </div>
                    {isApiSectionOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>

                {isApiSectionOpen && (
                    <div className="p-4 pt-0 space-y-4 border-t border-border/50 mt-2">
                         {PROVIDERS.map((provider) => (
                            <div key={provider.id} className="space-y-2 pt-4 first:pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-foreground">{provider.name} API Key</label>
                                    <a href={PROVIDER_URLS[provider.id]} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                        Get Key <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={revealedKeys[provider.id] ? getCredential(provider.id) : (getCredential(provider.id) ? getCredential(provider.id).slice(0, 8) + '••••••••••••••••' : '')}
                                        onChange={(e) => (revealedKeys[provider.id] || !getCredential(provider.id)) && handleKeyChange(provider.id, e.target.value)}
                                        readOnly={!revealedKeys[provider.id] && !!getCredential(provider.id)}
                                        className={`w-full bg-background border border-border rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono ${(!revealedKeys[provider.id] && !!getCredential(provider.id)) && 'opacity-75 cursor-default'}`}
                                        placeholder={revealedKeys[provider.id] ? "sk-..." : "No API Key set"}
                                    />
                                    {!!getCredential(provider.id) && (
                                        <button
                                            onClick={() => toggleReveal(provider.id)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            title={revealedKeys[provider.id] ? 'Hide and Lock' : 'Reveal and Edit'}
                                        >
                                            {revealedKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                         ))}
                        <p className="text-xs text-muted-foreground pt-2">
                            API keys are stored locally on your device and are never sent to any server other than the respective AI provider.
                        </p>
                    </div>
                )}
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

import React, { useRef } from 'react';
import { Download, Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/hooks/use-storage';

export default function AdvancedSettings() {
  const { exportData, importData } = useStorage();
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
        <div className="space-y-2 pb-4 border-b border-border">
            <h2 className="text-2xl font-display font-bold text-foreground">Advanced Settings</h2>
            <p className="text-muted-foreground">Manage your local data and application preferences.</p>
        </div>

        <div className="space-y-4">
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

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Loader2, Check, AlertCircle } from 'lucide-react';
import type { ApiCredential, ApiProvider } from '@/lib/storage';
import { fetchModels, type Model } from '@/lib/llm';

interface ModelPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: Model) => void;
  currentModelId?: string;
  apiCredentials: ApiCredential[];
}

const PROVIDERS: { id: ApiProvider | 'all'; name: string; icon?: React.ReactNode }[] = [
  { id: 'all', name: 'All Models' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google' },
];

export default function ModelPicker({ isOpen, onClose, onSelect, currentModelId, apiCredentials }: ModelPickerProps) {
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configuredProviders = useMemo(() => {
    const configured = new Set(apiCredentials.map(c => c.provider));
    return PROVIDERS.filter(p => p.id === 'all' || configured.has(p.id as ApiProvider));
  }, [apiCredentials]);

  const unconfiguredProviders = useMemo(() => {
    const configured = new Set(apiCredentials.map(c => c.provider));
    return PROVIDERS.filter(p => p.id !== 'all' && !configured.has(p.id as ApiProvider));
  }, [apiCredentials]);

  useEffect(() => {
    if (!isOpen) return;

    const loadModels = async () => {
      setIsLoading(true);
      setError(null);
      setModels([]);

      try {
        let fetchedModels: Model[] = [];

        if (selectedProvider === 'all') {
            const promises = apiCredentials.map(async (cred) => {
                try {
                    return await fetchModels(cred.provider, cred.key);
                } catch (e) {
                    console.error(`Failed to fetch ${cred.provider}`, e);
                    return [];
                }
            });
            const results = await Promise.all(promises);
            fetchedModels = results.flat();
        } else {
            const cred = apiCredentials.find(c => c.provider === selectedProvider);
            if (cred) {
                fetchedModels = await fetchModels(selectedProvider, cred.key);
            }
        }

        // Sort alphabetically by name
        fetchedModels.sort((a, b) => a.name.localeCompare(b.name));
        setModels(fetchedModels);
      } catch (err) {
        console.error("Error loading models", err);
        setError("Failed to load models. Please check your API keys.");
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [isOpen, selectedProvider, apiCredentials]);

  const filteredModels = useMemo(() => {
    return models.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery]);

  useEffect(() => {
    if (!isOpen) {
        setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-4xl h-[80vh] bg-[#09090b] border border-white/10 rounded-xl shadow-2xl z-[160] flex overflow-hidden flex-col md:flex-row"
          >
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-[#111114] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Models</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {configuredProviders.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedProvider(p.id as any)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                selectedProvider === p.id
                                ? 'bg-primary/20 text-primary font-medium'
                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {p.name}
                            {selectedProvider === p.id && <Check className="h-3 w-3" />}
                        </button>
                    ))}
                </div>

                {/* Add Provider Section */}
                {unconfiguredProviders.length > 0 && (
                     <div className="p-2 border-t border-white/10 mt-auto">
                        <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                            Add Provider
                        </div>
                        <a
                            href={`/settings?focus=api`}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2 group"
                        >
                            <Plus className="h-3 w-3 group-hover:text-primary transition-colors" />
                            Add Provider
                        </a>
                     </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
                {/* Header / Search */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder={`Search ${models.length} models...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#18181b] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Model List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Loading models...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-red-400 gap-3">
                            <AlertCircle className="h-8 w-8" />
                            <p>{error}</p>
                        </div>
                    ) : filteredModels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                            <p>No models found.</p>
                            {searchQuery && <p className="text-sm mt-1">Try a different search term.</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {filteredModels.map((model) => (
                                <button
                                    key={`${model.provider}-${model.id}`}
                                    onClick={() => {
                                        onSelect(model);
                                        onClose();
                                    }}
                                    className={`flex items-center justify-between p-3 rounded-lg border text-left group transition-all ${
                                        currentModelId === model.id
                                        ? 'bg-primary/10 border-primary/50'
                                        : 'bg-[#18181b] border-white/5 hover:border-white/20 hover:bg-[#202024]'
                                    }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-medium text-white truncate">{model.name}</span>
                                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-500 border border-white/5">
                                                {model.provider}
                                            </span>
                                        </div>
                                        <div className="text-xs text-zinc-500 flex items-center gap-3">
                                            <span className="font-mono text-zinc-600">{model.id}</span>
                                            {model.contextWindow && (
                                                <span>{Math.round(model.contextWindow / 1000)}k ctx</span>
                                            )}
                                        </div>
                                    </div>
                                    {currentModelId === model.id && (
                                        <div className="text-primary">
                                            <Check className="h-5 w-5" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Plus, Check, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/hooks/use-storage';
import { MODELS, PROVIDERS } from '@/lib/llm';
import { cn } from '@/lib/utils';

interface ModelPickerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModelPicker({ isOpen, onClose }: ModelPickerProps) {
    const { apiCredentials, defaultModel, setDefaultModel } = useStorage();
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

    // Filter available providers (those with keys)
    const availableProviders = PROVIDERS.filter(p =>
        apiCredentials.some(c => c.provider === p.id && c.key)
    );

    // Determine if we are in Zero State
    const isZeroState = availableProviders.length === 0;

    // Background locking for mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Set initial selected provider if not set or invalid
    useEffect(() => {
        if (isOpen && availableProviders.length > 0) {
             // If currently selected provider is no longer available (e.g. key removed), reset
             if (selectedProvider && !availableProviders.some(p => p.id === selectedProvider)) {
                 setSelectedProvider(null);
             }

             // If no provider selected, try to select default model's provider, else first available
             if (!selectedProvider) {
                 const currentModel = MODELS.find(m => m.id === defaultModel);
                 if (currentModel && availableProviders.some(p => p.id === currentModel.provider)) {
                     setSelectedProvider(currentModel.provider);
                 } else {
                     setSelectedProvider(availableProviders[0].id);
                 }
             }
        }
    }, [isOpen, availableProviders, defaultModel, selectedProvider]);


    const handleModelSelect = (modelId: string) => {
        setDefaultModel(modelId);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[150]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[160]",
                            "w-full max-w-[90vw] md:w-[600px] md:max-w-[40%]", // Desktop sizing
                            "bg-card border border-border shadow-2xl rounded-xl overflow-hidden",
                            "flex flex-col",
                            isZeroState ? "h-auto" : "h-[85vh] md:h-[600px] max-h-[85vh]" // Height constraints
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
                            <h2 className="font-display font-bold text-lg flex items-center gap-2 text-foreground">
                                <Zap className="h-5 w-5 text-primary" />
                                Select Model
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        {isZeroState ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="p-4 rounded-full bg-muted/50">
                                    <Settings className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-foreground">No Model Providers Configured</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                                        Configure an API key to start using AI features.
                                    </p>
                                </div>
                                <Button asChild className="w-full max-w-xs">
                                    <a href="/settings">
                                        Configure Providers
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex-1 flex overflow-hidden">
                                {/* Sidebar (Providers) */}
                                <div className="w-1/3 border-r border-border/50 bg-muted/10 flex flex-col overflow-y-auto shrink-0">
                                    <div className="p-2 space-y-1">
                                        {availableProviders.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedProvider(p.id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors",
                                                    selectedProvider === p.id
                                                        ? "bg-primary/10 text-primary"
                                                        : "hover:bg-muted/50 text-foreground/80"
                                                )}
                                            >
                                                <span>{p.name}</span>
                                                {selectedProvider === p.id && <ChevronRight className="h-4 w-4" />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-auto p-2 border-t border-border/50">
                                        <Button
                                            variant="ghost"
                                            asChild
                                            className="w-full justify-start text-muted-foreground hover:text-primary gap-2 text-xs h-9"
                                        >
                                            <a href="/settings">
                                                <Plus className="h-3 w-3" />
                                                Add Provider
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                {/* Main Content (Models) */}
                                <div className="flex-1 overflow-y-auto p-2">
                                    {selectedProvider && (
                                        <div className="space-y-1">
                                            {MODELS.filter(m => m.provider === selectedProvider).map(model => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => handleModelSelect(model.id)}
                                                    className={cn(
                                                        "w-full text-left p-3 rounded-lg border transition-all duration-200 group relative",
                                                        defaultModel === model.id
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-transparent hover:bg-muted/50 hover:border-border/50"
                                                    )}
                                                >
                                                    <div className="flex flex-col gap-1 pr-6">
                                                        <span className={cn(
                                                            "font-medium text-sm",
                                                            defaultModel === model.id ? "text-primary" : "text-foreground"
                                                        )}>
                                                            {model.name}
                                                        </span>
                                                        {model.description && (
                                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                                {model.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {defaultModel === model.id && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { Settings, Check, Type, Palette, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
  const [theme, setTheme] = useState('research');
  const [font, setFont] = useState('research');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize state from localStorage
    const savedTheme = localStorage.getItem('theme') || 'research';
    const savedFont = localStorage.getItem('font') || 'research';
    setTheme(savedTheme);
    setFont(savedFont);

    // Ensure DOM is synced (in case script missed something or for hydration)
    applyTheme(savedTheme);
    applyFont(savedFont);

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (newTheme: string) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'swiss') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  const applyFont = (newFont: string) => {
    document.documentElement.setAttribute('data-font', newFont);
    localStorage.setItem('font', newFont);
    setFont(newFont);
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
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
          >
             <div className="p-4 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h3 className="font-display font-bold text-lg text-foreground">Appearance</h3>
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
                                onClick={() => applyTheme(t.id)}
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
                                onClick={() => applyFont(f.id)}
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
             </div>

             {/* Footer gradient */}
             <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

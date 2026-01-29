import React, { useState, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { CATEGORY_GROUPS, CATEGORY_MAP } from '../lib/categories';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Flatten categories for search
const ALL_CATEGORIES = Object.entries(CATEGORY_MAP).map(([id, name]) => ({
    id,
    name,
    searchStr: `${name.toLowerCase()} ${id.toLowerCase()}`
}));

export default function CategoryBrowser() {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [isPending, startTransition] = useTransition();
    const [isFocused, setIsFocused] = useState(false);

    // Derived state for the dropdown suggestions (search as you type)
    const suggestions = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return ALL_CATEGORIES
            .filter(cat => cat.searchStr.includes(q))
            .slice(0, 10);
    }, [query]);

    // Derived state for the main list (filtered by activeFilter)
    const filteredGroups = useMemo(() => {
        const q = activeFilter.toLowerCase();
        if (!q) return Object.entries(CATEGORY_GROUPS);

        return Object.entries(CATEGORY_GROUPS)
            .map(([groupName, ids]) => {
                const filteredIds = ids.filter(id => {
                    const name = CATEGORY_MAP[id];
                    const searchStr = `${name.toLowerCase()} ${id.toLowerCase()}`;
                    return searchStr.includes(q);
                });
                return [groupName, filteredIds] as [string, string[]];
            })
            .filter(([_, ids]) => ids.length > 0);
    }, [activeFilter]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsFocused(false);
        startTransition(() => {
            setActiveFilter(query);
        });
    };

    const handleSuggestionClick = (cat: typeof ALL_CATEGORIES[0]) => {
        setQuery(cat.name); // Or cat.id? Let's use name for display
        setIsFocused(false);
        startTransition(() => {
            setActiveFilter(cat.searchStr);
        });
    };

    const showDropdown = isFocused && query && suggestions.length > 0;

    return (
        <div className="space-y-12">
            {/* Header & Search Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">All Categories</h1>
                    <p className="text-muted-foreground text-lg mt-2">Browse papers by subject domain</p>
                </div>

                <div className="relative w-full md:w-[400px] z-50">
                    <form onSubmit={handleSearch} className="relative">
                         <div className="relative group">
                             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                             <Input
                                type="text"
                                placeholder="Filter categories..."
                                className="pl-10 h-10 bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    if (e.target.value === '') {
                                        startTransition(() => setActiveFilter(''));
                                    }
                                }}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
                             />
                         </div>
                    </form>

                    {/* Dropdown Suggestions */}
                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50"
                                style={{ maxHeight: '300px', overflowY: 'auto' }}
                            >
                                <div className="p-1">
                                    {suggestions.map((cat) => (
                                        <button
                                            key={cat.id}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-sm flex items-center justify-between group transition-colors"
                                            onClick={() => handleSuggestionClick(cat)}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            <span className="text-xs text-muted-foreground group-hover:text-primary/70 font-mono ml-2">{cat.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content List */}
            <motion.div
                layout
                className="space-y-12"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredGroups.map(([groupName, categoryIds]) => (
                        <motion.section
                            layout
                            key={groupName}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.h2 layout className="text-2xl font-display font-semibold mb-6 flex items-center gap-2 text-primary">
                                {groupName}
                            </motion.h2>
                            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categoryIds.map(id => (
                                    <motion.div
                                        layout
                                        key={id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <a href={`/search?q=cat:${id}`} className="block h-full group">
                                            <Card className="h-full bg-card/50 hover:bg-card hover:border-primary transition-all group-hover:shadow-md">
                                                <CardHeader>
                                                    <CardTitle className="group-hover:text-primary transition-colors text-lg">{CATEGORY_MAP[id]}</CardTitle>
                                                    <CardDescription className="font-mono text-xs uppercase tracking-widest text-muted-foreground/70">{id}</CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </a>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.section>
                    ))}
                </AnimatePresence>

                {filteredGroups.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-muted-foreground"
                    >
                        No categories found matching "{activeFilter}"
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

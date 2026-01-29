import React, { useState, useTransition, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { CATEGORY_GROUPS, CATEGORY_MAP } from '../lib/categories';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CategoryBrowser() {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [isPending, startTransition] = useTransition();

    // Debounce effect: update activeFilter when query changes after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            startTransition(() => {
                setActiveFilter(query);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Derived state for the main list (filtered by activeFilter)
    const filteredGroups = useMemo(() => {
        const q = activeFilter.toLowerCase().trim();
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Force immediate update on submit
        startTransition(() => {
            setActiveFilter(query);
        });
    };

    return (
        <div className="space-y-12">
            {/* Header & Search Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">All Categories</h1>
                    <p className="text-muted-foreground text-lg mt-2">Browse papers by subject domain</p>
                </div>

                <div className="relative w-full md:w-[400px] z-50">
                    <form onSubmit={handleSearch} className="flex w-full items-center gap-0">
                         <div className="relative w-full group">
                             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                             <Input
                                type="search"
                                placeholder="Filter categories..."
                                className="pl-10 h-10 bg-background border-r-0 rounded-r-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                             />
                         </div>
                         <Button type="submit" className="h-10 px-6 rounded-l-none border border-l-0 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                            Search
                        </Button>
                    </form>
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

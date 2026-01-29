import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { allSections } from '@/lib/categories';

export default function CategoryBrowser() {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    // Flatten categories for the dropdown search
    const allCategories = useMemo(() => {
        return allSections.flatMap(section =>
            section.data.map(cat => ({
                ...cat,
                section: section.title
            }))
        );
    }, []);

    const suggestions = useMemo(() => {
        if (!query) return [];
        const lowerQ = query.toLowerCase();
        return allCategories.filter(cat =>
            cat.name.toLowerCase().includes(lowerQ) ||
            cat.id.toLowerCase().includes(lowerQ) ||
            cat.section.toLowerCase().includes(lowerQ)
        );
    }, [query, allCategories]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setShowDropdown(true);
        if (e.target.value === "") {
            setFilter("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setFilter(query);
            setShowDropdown(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setFilter(suggestion);
        setShowDropdown(false);
    };

    const filteredSections = useMemo(() => {
        if (!filter) return allSections;
        const lowerFilter = filter.toLowerCase();

        return allSections.map(section => ({
            ...section,
            data: section.data.filter(cat =>
                cat.name.toLowerCase().includes(lowerFilter) ||
                cat.id.toLowerCase().includes(lowerFilter)
            )
        })).filter(section => section.data.length > 0);
    }, [filter]);

    return (
        <div className="space-y-12">
            <div className="relative max-w-2xl mx-auto z-50">
                <div className="relative group">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="search"
                        placeholder="FILTER_CATEGORIES..."
                        className="pl-10 h-12 bg-background border-primary/20 focus-visible:ring-0 focus-visible:border-primary transition-colors shadow-[0_0_10px_hsl(var(--primary)/0.05)]"
                        value={query}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click
                    />
                </div>

                <AnimatePresence>
                    {showDropdown && query && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-card border border-primary/20 rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto z-50"
                        >
                            {suggestions.map((cat) => (
                                <button
                                    key={cat.id}
                                    className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors flex items-center justify-between group border-b border-primary/10 last:border-0"
                                    onClick={() => handleSuggestionClick(cat.name)}
                                >
                                    <span className="text-foreground group-hover:text-primary transition-colors font-medium">{cat.section} &gt; {cat.name}</span>
                                    <span className="text-xs font-mono text-muted-foreground">{cat.id}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div layout className="space-y-12">
                <AnimatePresence mode="popLayout">
                    {filteredSections.map((section) => (
                        <motion.section
                            key={section.title}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-xl text-primary font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary"></span>
                                [ {section.title} ]
                            </h2>
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {section.data.map(cat => (
                                        <motion.a
                                            key={cat.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            href={`/search?q=cat:${cat.id}`}
                                            className="block h-full group"
                                        >
                                            <Card className="h-full bg-card/50 hover:bg-card hover:border-primary transition-all group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.1)]">
                                                <CardHeader>
                                                    <CardTitle className="group-hover:text-primary transition-colors">{cat.name}</CardTitle>
                                                    <CardDescription className="font-mono text-xs uppercase tracking-widest text-primary/70">{cat.id}</CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </motion.a>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </motion.section>
                    ))}
                </AnimatePresence>
                {filteredSections.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-muted-foreground"
                    >
                        NO_MATCHING_DOMAINS_FOUND
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

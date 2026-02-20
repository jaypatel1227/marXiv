import React, { useState } from 'react';
import { Menu, X, Home, BookOpen, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} aria-label="Open Menu">
                <Menu className="h-5 w-5" />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-3/4 max-w-sm bg-card border-l border-border z-50 p-6 flex flex-col gap-8 shadow-2xl h-[100dvh]"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-display font-bold text-xl">Menu</span>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close Menu">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="space-y-6 flex-1 overflow-y-auto">
                                <div className="pt-2">
                                    <SearchBar className="w-full" />
                                </div>

                                <nav className="flex flex-col gap-2">
                                    <a
                                        href="/"
                                        className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/50 transition-colors text-lg font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Home className="h-5 w-5 text-muted-foreground" />
                                        Home
                                    </a>
                                    <a
                                        href="/categories"
                                        className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/50 transition-colors text-lg font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                                        Categories
                                    </a>
                                    <a
                                        href="https://github.com/jaypatel1227/marXiv"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/50 transition-colors text-lg font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Github className="h-5 w-5 text-muted-foreground" />
                                        GitHub
                                    </a>
                                </nav>
                            </div>

                            <div className="pt-4 border-t border-border text-xs text-muted-foreground text-center">
                                &copy; {new Date().getFullYear()} marXiv
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

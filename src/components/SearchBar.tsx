import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

export default function SearchBar({ initialQuery = "", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex w-full items-center gap-0 ${className}`}>
      <div className="relative w-full group">
         <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
         <Input
            type="search"
            placeholder="ENTER_QUERY..."
            className="pl-10 h-12 bg-background border-r-0 border-primary/20 focus-visible:ring-0 focus-visible:border-primary transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
         />
      </div>
      <Button type="submit" className="h-12 px-6 border border-l-0 border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
        SEARCH
      </Button>
    </form>
  );
}

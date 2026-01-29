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
    <form onSubmit={handleSubmit} className={`flex w-full items-center space-x-2 ${className}`}>
      <div className="relative w-full">
         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
         <Input
            type="search"
            placeholder="Search arXiv papers..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
         />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}

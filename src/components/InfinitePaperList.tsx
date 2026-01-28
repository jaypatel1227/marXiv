import React, { useState, useEffect, useRef } from 'react';
import type { ArxivPaper } from "@/lib/arxiv";
import PaperCard from "./PaperCard";
import { Loader2 } from "lucide-react";

interface InfinitePaperListProps {
  initialPapers: ArxivPaper[];
  query: string;
  totalResults: number;
}

export default function InfinitePaperList({ initialPapers, query, totalResults }: InfinitePaperListProps) {
  const [papers, setPapers] = useState<ArxivPaper[]>(initialPapers);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPapers.length < totalResults);
  const [offset, setOffset] = useState(initialPapers.length);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPapers(initialPapers);
    setHasMore(initialPapers.length < totalResults);
    setOffset(initialPapers.length);
  }, [initialPapers, query, totalResults]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePapers();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, offset, query]);

  const loadMorePapers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search.json?q=${encodeURIComponent(query)}&start=${offset}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (data.entries && data.entries.length > 0) {
        setPapers(prev => [...prev, ...data.entries]);
        setOffset(prev => prev + data.entries.length);
        if (offset + data.entries.length >= data.totalResults) {
            setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && hasMore && (
        <div ref={observerTarget} className="h-10 w-full" />
      )}

      {!hasMore && papers.length > 0 && (
         <div className="text-center py-8 text-muted-foreground">
            You've reached the end of the list.
         </div>
      )}

      {papers.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
              No papers found.
          </div>
      )}
    </div>
  );
}

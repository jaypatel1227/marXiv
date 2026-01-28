import React from 'react';
import type { ArxivPaper } from "@/lib/arxiv";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, User, ArrowRight } from "lucide-react";

interface PaperCardProps {
  paper: ArxivPaper;
}

export default function PaperCard({ paper }: PaperCardProps) {
  return (
    <Card className="group flex flex-col h-full bg-card/50 hover:bg-card transition-all border-l-2 border-l-muted hover:border-l-primary hover:shadow-[0_0_20px_-10px_hsl(var(--primary)/0.2)]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4 mb-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                ID: {paper.shortId}
            </span>
            <Badge variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                {paper.category}
            </Badge>
        </div>
        <a href={`/paper/${paper.shortId}`} className="block group-hover:text-primary transition-colors">
            <CardTitle className="text-xl leading-tight">{paper.title}</CardTitle>
        </a>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="flex flex-wrap gap-4 text-[10px] font-mono text-muted-foreground mb-4 uppercase tracking-wider">
             <div className="flex items-center">
                <Calendar className="mr-1.5 h-3 w-3" />
                {new Date(paper.published).toLocaleDateString()}
            </div>
             <div className="flex items-center">
                <User className="mr-1.5 h-3 w-3" />
                <span className="truncate max-w-[200px]">
                    {paper.authors.slice(0, 2).join(", ")}
                    {paper.authors.length > 2 && " et al."}
                </span>
             </div>
        </div>
        <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed font-sans">
          {paper.summary}
        </p>
      </CardContent>
      <CardFooter className="pt-0 gap-3">
        <Button asChild variant="outline" size="sm" className="flex-1 h-9 text-xs border-primary/20 hover:border-primary hover:bg-primary/10 hover:text-primary">
            <a href={`/paper/${paper.shortId}`}>
                READ_DATA <ArrowRight className="ml-2 h-3 w-3" />
            </a>
        </Button>
        {paper.pdfLink && (
             <Button asChild variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground hover:text-primary hover:bg-primary/5">
                <a href={paper.pdfLink} target="_blank" rel="noopener noreferrer" title="Download PDF">
                    <FileText className="h-4 w-4" />
                </a>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

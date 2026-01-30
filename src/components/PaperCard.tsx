import React from 'react';
import type { ArxivPaper } from "@/lib/arxiv";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, User, ArrowRight } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface PaperCardProps {
  paper: ArxivPaper;
}

export default function PaperCard({ paper }: PaperCardProps) {
  return (
    <Card className="group flex flex-col h-full bg-card/50 hover:bg-card transition-all border-l-2 border-l-border hover:border-l-primary hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4 mb-2">
            <span className="font-mono text-[10px] text-muted-foreground">
                {paper.shortId}
            </span>
            <Badge variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                {paper.category}
            </Badge>
        </div>
        <a href={`/paper/${paper.shortId}`} className="block group-hover:text-primary transition-colors">
            <CardTitle className="text-xl leading-tight font-bold">
              <MarkdownRenderer content={paper.title} components={{ p: 'span' }} />
            </CardTitle>
        </a>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
             <div className="flex items-center">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                {new Date(paper.published).toLocaleDateString()}
            </div>
             <div className="flex items-center">
                <User className="mr-1.5 h-3.5 w-3.5" />
                <span className="truncate max-w-[200px]" title={paper.authors.join(", ")}>
                    {paper.authors.slice(0, 2).join(", ")}
                    {paper.authors.length > 2 && " et al."}
                </span>
             </div>
        </div>
        <div className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed">
            <MarkdownRenderer
              content={paper.summary}
              components={{ p: 'span' }}
            />
        </div>
      </CardContent>
      <CardFooter className="pt-0 gap-3">
        <Button asChild variant="outline" size="sm" className="flex-1">
            <a href={`/paper/${paper.shortId}`}>
                View Abstract <ArrowRight className="ml-2 h-4 w-4" />
            </a>
        </Button>
        {paper.pdfLink && (
             <Button asChild variant="ghost" size="sm" className="px-3" title="Download PDF">
                <a href={paper.pdfLink} target="_blank" rel="noopener noreferrer" aria-label="Download PDF (opens in new tab)">
                    <FileText className="h-4 w-4" />
                </a>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

import React from 'react';
import type { ArxivPaper } from "@/lib/arxiv";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, User } from "lucide-react";

interface PaperCardProps {
  paper: ArxivPaper;
}

export default function PaperCard({ paper }: PaperCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <a href={`/paper/${paper.shortId}`} className="hover:underline decoration-primary">
                <CardTitle className="text-lg font-bold leading-tight text-primary">{paper.title}</CardTitle>
            </a>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">{paper.category}</Badge>
            <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(paper.published).toLocaleDateString()}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {paper.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-y-1 gap-x-4 text-xs text-muted-foreground">
             <div className="flex items-center">
                <User className="mr-1 h-3 w-3" />
                <span className="truncate max-w-[200px]">
                    {paper.authors.slice(0, 3).join(", ")}
                    {paper.authors.length > 3 && " et al."}
                </span>
             </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" size="sm" className="w-full">
            <a href={`/paper/${paper.shortId}`}>View Details</a>
        </Button>
        {paper.pdfLink && (
             <Button asChild variant="default" size="sm" className="w-full ml-2">
                <a href={paper.pdfLink} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" /> PDF
                </a>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

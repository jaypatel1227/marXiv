import { useState } from 'react';
import { useNotes } from '../hooks/use-notes';
import { NoteCard } from './NoteCard';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Plus, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface NotesSectionProps {
    paperId: string;
    paperTitle: string;
}

export function NotesSection({ paperId, paperTitle }: NotesSectionProps) {
    const { notes, isLoading, add, update, remove } = useNotes(paperId, paperTitle);
    const [isAdding, setIsAdding] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAdd = async () => {
        if (!newNoteContent.trim()) return;
        setIsSaving(true);
        try {
            await add(newNoteContent);
            setNewNoteContent('');
            setIsAdding(false);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-24 bg-muted/20 rounded-lg"></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h3 className="font-mono text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary"></span>
                    Notes ({notes.length})
                </h3>
                {!isAdding && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-mono text-xs border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus className="mr-2 h-3 w-3" /> Add Note
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="bg-background/50 border-dashed border-primary/50 relative overflow-hidden">
                    <CardContent className="pt-6 px-6 pb-6 space-y-4">
                        <Textarea
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            placeholder="Type your note here..."
                            className="font-mono text-sm bg-background border-primary/20 focus-visible:ring-primary/20 min-h-[100px]"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSaving}>
                                <X className="mr-2 h-3 w-3" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleAdd} disabled={isSaving || !newNoteContent.trim()}>
                                <Plus className="mr-2 h-3 w-3" /> Add Note
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {notes.length === 0 && !isAdding ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground text-sm font-mono">No notes yet. Add one to track your thoughts.</p>
                    </div>
                ) : (
                    notes.slice().reverse().map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onUpdate={update}
                            onDelete={remove}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

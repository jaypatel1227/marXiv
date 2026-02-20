import { useState, useEffect } from 'react';
import { useNotes } from '../hooks/use-notes';
import { NoteCard } from './NoteCard';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Plus, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Reorder, useDragControls } from 'framer-motion';

interface NotesSectionProps {
    paperId: string;
    paperTitle: string;
}

export function NotesSection({ paperId, paperTitle }: NotesSectionProps) {
    const { notes, isLoading, add, update, remove, reorder } = useNotes(paperId, paperTitle);
    const [isAdding, setIsAdding] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // We reverse the notes for display (newest first) by default in many apps,
    // BUT for drag and drop reordering, we usually want to manipulate the source array directly.
    // If we want "visual" reverse but "logical" append, it gets tricky with DnD.
    // Let's assume the user wants full control over order, so we display `notes` as is.
    // When adding, we push to end.
    // Ideally, for a "Note taking" app, new notes might go to top or bottom.
    // The previous implementation did `notes.slice().reverse().map(...)`.
    // If we want manual reordering, we should probably just show them in the order stored in DB.
    // And let the user drag them to wherever they want.
    // So we will stop reversing them here and rely on the array order.

    // However, `addNoteToPaper` pushes to the END of the array.
    // If we want new notes at the top, we should unshift, or let the user drag it there.
    // Let's stick to "Order in DB is Order on Screen".

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

            {notes.length === 0 && !isAdding ? (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground text-sm font-mono">No notes yet. Add one to track your thoughts.</p>
                </div>
            ) : (
                <Reorder.Group axis="y" values={notes} onReorder={reorder} className="grid gap-4">
                    {notes.map(note => (
                        <NoteItem
                            key={note.id}
                            note={note}
                            onUpdate={update}
                            onDelete={remove}
                        />
                    ))}
                </Reorder.Group>
            )}
        </div>
    );
}

// Wrapper component to handle DragControls for each item
function NoteItem({ note, onUpdate, onDelete }: { note: any, onUpdate: any, onDelete: any }) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={note}
            dragListener={false}
            dragControls={dragControls}
            className="relative"
        >
            <NoteCard
                note={note}
                onUpdate={onUpdate}
                onDelete={onDelete}
                dragControls={dragControls}
            />
        </Reorder.Item>
    );
}

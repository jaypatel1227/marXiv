import { useState } from 'react';
import type { Note } from '../lib/storage';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface NoteCardProps {
    note: Note;
    onUpdate: (id: string, content: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(note.content);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!editContent.trim()) return;
        setIsSaving(true);
        try {
            await onUpdate(note.id, editContent);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditContent(note.content);
        setIsEditing(false);
    };

    return (
        <Card className="bg-background/50 border-dashed border-muted-foreground/30 relative overflow-hidden group hover:border-primary/30 transition-colors">
             <CardContent className="pt-6 px-6 pb-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                        {new Date(note.createdAt).toLocaleString()}
                        {note.updatedAt !== note.createdAt && ' (edited)'}
                    </div>
                    {!isEditing && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                onClick={() => setIsEditing(true)}
                                aria-label="Edit Note"
                            >
                                <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => onDelete(note.id)}
                                aria-label="Delete Note"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="font-mono text-sm bg-background border-primary/20 focus-visible:ring-primary/20 min-h-[100px]"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
                                <X className="mr-2 h-3 w-3" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                <Check className="mr-2 h-3 w-3" /> Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-foreground/90 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                        {note.content}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

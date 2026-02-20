import { useState } from 'react';
import type { Note } from '../lib/storage';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Edit2, Trash2, Check, X, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, useDragControls, Reorder } from 'framer-motion';

interface NoteCardProps {
    note: Note;
    onUpdate: (id: string, content: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    dragControls?: any; // Framer Motion drag controls
}

export function NoteCard({ note, onUpdate, onDelete, dragControls }: NoteCardProps) {
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
        <Card
            // Added tabIndex={0} to make the card focusable
            // Added focus:ring-1 focus:ring-primary/30 outline-none for focus styling
            // Added group-focus-within logic to revealing sections
            tabIndex={0}
            className="bg-background/80 backdrop-blur-sm border border-border/40 hover:border-primary/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md"
        >
             <CardContent className="p-0">
                {/* Drag Handle - Always visible on all devices now (as requested) */}
                {/* Added touch-none to prevent scrolling while dragging */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-100 transition-opacity z-10 hover:bg-muted/30 touch-none"
                    onPointerDown={(e) => dragControls?.start(e)}
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                </div>

                <div className="pl-10 pr-4 py-4">
                    {isEditing ? (
                        <div className="space-y-3">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="font-mono text-sm bg-background border-primary/20 focus-visible:ring-primary/20 min-h-[100px] resize-none"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving} className="h-7 text-xs">
                                    <X className="mr-2 h-3 w-3" /> Cancel
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-7 text-xs">
                                    <Check className="mr-2 h-3 w-3" /> Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="text-foreground/90 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                                {note.content}
                            </div>

                            {/* Metadata and Actions - Always visible on mobile, reveal on hover/focus for desktop */}
                            <div className="h-auto pt-3 sm:h-0 sm:overflow-hidden sm:group-hover:h-auto sm:group-focus:h-auto sm:group-focus-within:h-auto sm:group-hover:pt-3 sm:group-focus:pt-3 sm:group-focus-within:pt-3 transition-all duration-300 ease-in-out">
                                <div className="flex justify-between items-center border-t border-border/30 pt-2">
                                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                        {new Date(note.createdAt).toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        {note.updatedAt !== note.createdAt && ' (edited)'}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                            onClick={() => setIsEditing(true)}
                                            aria-label="Edit Note"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => onDelete(note.id)}
                                            aria-label="Delete Note"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

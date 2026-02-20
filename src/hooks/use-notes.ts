import { useState, useEffect, useCallback } from 'react';
import {
    getNotesForPaper,
    addNoteToPaper,
    updateNoteInPaper,
    deleteNoteFromPaper,
    reorderNotesInPaper,
    type Note
} from '../lib/storage';

const NOTES_EVENT = 'marxiv-notes-update';

export function useNotes(paperId: string, paperTitle: string) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotes = useCallback(async () => {
        try {
            const paperNote = await getNotesForPaper(paperId);
            setNotes(paperNote?.notes || []);
        } catch (error) {
            console.error('Failed to load notes:', error);
        } finally {
            setIsLoading(false);
        }
    }, [paperId]);

    useEffect(() => {
        loadNotes();

        const handleNotesUpdate = (event: CustomEvent) => {
            if (event.detail.paperId === paperId) {
                // If the event provides the new notes directly (from local reorder), use them
                // Otherwise reload from DB
                if (event.detail.notes) {
                    setNotes(event.detail.notes);
                } else {
                    loadNotes();
                }
            }
        };

        window.addEventListener(NOTES_EVENT as any, handleNotesUpdate);
        return () => window.removeEventListener(NOTES_EVENT as any, handleNotesUpdate);
    }, [loadNotes, paperId]);

    const add = useCallback(async (content: string) => {
        try {
            const newNote = await addNoteToPaper(paperId, paperTitle, content);
            setNotes(prev => [...prev, newNote]);
            window.dispatchEvent(new CustomEvent(NOTES_EVENT, { detail: { paperId } }));
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    }, [paperId, paperTitle]);

    const update = useCallback(async (noteId: string, content: string) => {
        try {
            await updateNoteInPaper(paperId, noteId, content);
            setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n));
            window.dispatchEvent(new CustomEvent(NOTES_EVENT, { detail: { paperId } }));
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    }, [paperId]);

    const remove = useCallback(async (noteId: string) => {
        try {
            await deleteNoteFromPaper(paperId, noteId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
            window.dispatchEvent(new CustomEvent(NOTES_EVENT, { detail: { paperId } }));
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    }, [paperId]);

    const reorder = useCallback(async (newNotes: Note[]) => {
        // Optimistic update
        setNotes(newNotes);
        try {
            await reorderNotesInPaper(paperId, newNotes);
            // Dispatch event with new notes to keep sync fast without reload
            window.dispatchEvent(new CustomEvent(NOTES_EVENT, { detail: { paperId, notes: newNotes } }));
        } catch (error) {
            console.error('Failed to reorder notes:', error);
            // Revert on failure
            loadNotes();
        }
    }, [paperId, loadNotes]);

    return {
        notes,
        isLoading,
        add,
        update,
        remove,
        reorder
    };
}

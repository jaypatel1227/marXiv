import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModelPicker from './ModelPicker';

export default function ModelPickerTrigger() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Select Model"
            >
                <Zap className="h-5 w-5" />
            </Button>
            <ModelPicker isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}

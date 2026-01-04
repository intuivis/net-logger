

import React, { useEffect } from 'react';
import Button from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string;
    isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Confirm',
    isDestructive = false
}) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;

    const handleConfirmClick = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" aria-modal="true" role="dialog">
            <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-dark-text">{title}</h2>
                    <p className="text-md text-dark-text-secondary mt-2">{message}</p>
                </div>
                <div className="flex justify-end gap-4 p-4 bg-dark-800/50 rounded-b-lg">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirmClick}
                        variant={isDestructive ? 'destructive' : 'primary'}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

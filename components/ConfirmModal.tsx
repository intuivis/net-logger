
import React from 'react';

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
    if (!isOpen) return null;

    const handleConfirmClick = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-dark-text">{title}</h2>
                    <p className="text-md text-dark-text-secondary mt-2">{message}</p>
                </div>
                <div className="flex justify-end gap-4 p-4 bg-dark-800/50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-dark-text bg-dark-700 rounded-lg hover:bg-dark-600">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmClick}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
                            isDestructive
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-brand-primary hover:bg-brand-secondary'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;



import React, { useState, useEffect } from 'react';
import { JoinNetFormState } from '../types';

interface JoinNetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: (data: JoinNetFormState) => void;
    isJoining: boolean;
}

const FormInput = ({ label, id, ...props }: {label: string, id: string} & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <input
            id={id}
            {...props}
            className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11"
        />
    </div>
);

const JoinNetModal: React.FC<JoinNetModalProps> = ({ isOpen, onClose, onJoin, isJoining }) => {
    const [formData, setFormData] = useState<JoinNetFormState>({
        call_sign: '',
        name: '',
        location: '',
        notes: ''
    });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onJoin(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-dark-text">Join Net</h2>
                        <p className="text-sm text-dark-text-secondary">Let the Net Control Operator know you're listening.</p>
                    </div>
                    <div className="p-6 border-t border-b border-dark-700 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormInput label="Call Sign" id="join-call_sign" name="call_sign" value={formData.call_sign} onChange={handleChange} required autoFocus />
                            <FormInput label="Name" id="join-name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <FormInput label="Location (e.g., City, State)" id="join-location" name="location" value={formData.location} onChange={handleChange} required />
                        <FormInput label="Note to NCO (Optional)" id="join-notes" name="notes" value={formData.notes} onChange={handleChange} />
                    </div>
                    <div className="flex justify-end gap-4 p-4 bg-dark-800/50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-dark-text bg-dark-700 rounded-lg hover:bg-dark-600">
                            Cancel
                        </button>
                        <button type="submit" disabled={isJoining} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary disabled:opacity-50">
                            {isJoining ? 'Joining...' : 'Join'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinNetModal;

import React, { useState } from 'react';

interface PasscodeModalProps {
    netName: string;
    onVerify: (passcode: string) => void;
    onClose: () => void;
    error?: string | null;
    isVerifying: boolean;
}

const PasscodeModal: React.FC<PasscodeModalProps> = ({ netName, onVerify, onClose, error, isVerifying }) => {
    const [passcode, setPasscode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(passcode);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-dark-text">Enter Passcode</h2>
                        <p className="text-sm text-dark-text-secondary">Enter the passcode for "{netName}" to gain delegated permissions.</p>
                    </div>
                    <div className="p-6 border-t border-b border-dark-700 space-y-4">
                        <div>
                            <label htmlFor="passcode-input" className="block text-sm font-medium text-dark-text-secondary mb-1">
                                Passcode
                            </label>
                            <input
                                id="passcode-input"
                                type="text"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11"
                                placeholder="Alphanumeric passcode"
                                required
                                autoFocus
                            />
                        </div>
                        {error && (
                            <div className="p-3 bg-red-500/20 text-red-400 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-4 p-4 bg-dark-800/50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-dark-text bg-dark-700 rounded-lg hover:bg-dark-600">
                            Cancel
                        </button>
                        <button type="submit" disabled={isVerifying} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-wait">
                            {isVerifying ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasscodeModal;

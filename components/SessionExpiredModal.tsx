
import React from 'react';
import { Icon } from './Icon';

interface SessionExpiredModalProps {
    onLogin: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ onLogin }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" aria-modal="true" role="dialog">
            <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md m-4 text-center p-8" onClick={(e) => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/20 mb-4">
                   <Icon className="text-yellow-300 text-4xl">lock_clock</Icon>
                </div>
                <h2 className="text-2xl font-bold text-dark-text">Session Expired</h2>
                <p className="text-md text-dark-text-secondary mt-2">
                    For your security, your session has timed out due to inactivity.
                </p>
                <p className="text-md text-dark-text-secondary mt-1">
                    Please log in again to continue.
                </p>
                <div className="mt-8">
                    <button
                        onClick={onLogin}
                        className="w-full px-6 py-3 text-md font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-dark-800"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;

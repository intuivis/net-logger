import React from 'react';
import { Icon } from '../components/Icon';

interface ReleaseNotesScreenProps {
  onBack: () => void;
}

const ReleaseNotesScreen: React.FC<ReleaseNotesScreenProps> = ({ onBack }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-md font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
                <Icon className="text-xl">arrow_back</Icon>
                <span>Back</span>
            </button>

            <div className="space-y-8 bg-dark-800 p-6 sm:p-8 rounded-lg shadow-xl">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Release Notes</h1>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-brand-secondary pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.0.1 (Current)</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Wednesday, July, 23 2024</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Added application footer with user agreement, release notes, and feedback links.</li>
                            <li>Added user agreement on registration screen.</li>
                            <li>Added Intuivis, LLC branding.</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.0.0</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> July 2024</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Initial release of the NetControl application.</li>
                            <li>Features include NET creation, session management, and real-time check-in logging.</li>
                            <li>Activity charts for logged session check-ins.</li>
                            <li>User registration and administration panel.</li>
                            <li>Awards and badge system for operator engagement.</li>
                        </ul>
                    </div>
                </div>



            </div>
        </div>
    );
};

export default ReleaseNotesScreen;
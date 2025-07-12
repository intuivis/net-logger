
import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { View } from '../types';

interface PendingApprovalScreenProps {
    email: string | null;
    onSetView: (view: View) => void;
}

const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({ email, onSetView }) => {
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');
        } else {
            onSetView({ type: 'login' });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
            <div className="w-full max-w-md p-8 text-center bg-dark-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-yellow-400">Account Pending Approval</h2>
                <p className="mt-4 text-dark-text-secondary">
                    Your account ({email}) has been successfully created and is waiting for administrator approval.
                </p>
                <p className="mt-2 text-dark-text-secondary">
                    You will be able to access the application once your account has been approved. Thank you for your patience.
                </p>
                 <button
                    onClick={handleLogout}
                    className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-dark-800"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default PendingApprovalScreen;

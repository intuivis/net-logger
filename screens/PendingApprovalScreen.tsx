
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { View } from '../types';

interface PendingApprovalScreenProps {
    email: string | null;
    onSetView: (view: View) => void;
}

const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({ email, onSetView }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        const { error } = await (supabase.auth as any).signOut();
        
        if (error) {
            console.error('Error signing out:', error);
            alert('An unexpected error occurred during logout. Please try again.');
        }
        
        // Always reset the loading state to prevent the button from getting stuck.
        setIsLoggingOut(false);
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
            <div className="w-full max-w-md p-8 bg-dark-800 rounded-lg shadow-lg">
                <h2 className="text-2xl text-center font-bold text-yellow-400">Account Pending Approval</h2>
                <p className="mt-4 text-dark-text-secondary">
                    We take steps to verify each Net Control Operator prior to granting access. Your account ({email}) has been successfully created and is waiting for administrator approval.
                </p>
                <p className="mt-2 text-dark-text-secondary">
                    Once your account has been approved, you will be able to create and manage NETs. Thank you for your patience.
                </p>
                 <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-dark-800 disabled:bg-gray-500 disabled:cursor-wait"
                >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
            </div>
        </div>
    );
};

export default PendingApprovalScreen;

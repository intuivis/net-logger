

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { View } from '../types';

interface AccessRevokedScreenProps {
    email: string | null;
    onSetView: (view: View) => void;
}

const AccessRevokedScreen: React.FC<AccessRevokedScreenProps> = ({ email, onSetView }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            }
        } catch (error) {
            console.error('Exception during sign out:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
            <div className="w-full max-w-md p-8 bg-dark-800 rounded-lg shadow-lg">
                <h2 className="text-2xl text-center font-bold text-red-500">Account Access Revoked</h2>
                <p className="mt-4 text-dark-text-secondary">
                    Your access to the application for the account ({email}) has been revoked by an administrator. You will not be able to create or manage NETs.
                </p>
                <p className="mt-2 text-dark-text-secondary">
                    If you believe this is a mistake, please contact the system administrator.
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

export default AccessRevokedScreen;
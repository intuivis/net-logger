
import React from 'react';
import { Profile, View } from '../types';
import { supabase } from '../lib/supabaseClient';

interface HeaderProps {
    profile: Profile | null;
    onSetView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ profile, onSetView }) => {

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');
        } else {
            onSetView({ type: 'home' });
        }
    };

    return (
        <header className="bg-light-card dark:bg-dark-800 shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <button onClick={() => onSetView({ type: 'home' })} className="flex items-center space-x-3 group">
                         <h1 className="text-xl font-bold tracking-tight text-light-text dark:text-dark-text group-hover:text-brand-secondary transition-colors">
                             NET Logger
                         </h1>
                    </button>
                    <div className="flex items-center gap-4">
                        {profile ? (
                            <>
                                {profile.role === 'admin' && (
                                     <button
                                        onClick={() => onSetView({type: 'adminApprovals'})}
                                        className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors"
                                    >
                                        Manage NCOs
                                    </button>
                                )}
                                {(profile.is_approved || profile.role === 'admin') && (
                                    <button
                                        onClick={() => onSetView({type: 'manageNets'})}
                                        className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors"
                                    >
                                        Manage NETs
                                    </button>
                                )}
                                <span className="text-sm text-dark-text-secondary hidden sm:block">
                                    {profile.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => onSetView({ type: 'login' })}
                                    className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => onSetView({ type: 'register' })}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;